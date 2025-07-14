from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from scipy import stats
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error
import json
from typing import List, Optional, Dict, Any
import io

router = APIRouter()

# Global variable to store the main dataset
main_dataset = None

@router.post("/hypothesis-test")
async def hypothesis_test(request_data: dict):
    """Run hypothesis testing (t-test, ANOVA)"""
    try:
        global main_dataset
        if main_dataset is None:
            raise HTTPException(status_code=400, detail="No dataset loaded")
        
        test_type = request_data.get("testType", "t-test")
        group_column = request_data.get("groupColumn")
        value_column = request_data.get("valueColumn")
        alpha = request_data.get("alpha", 0.05)
        alternative = request_data.get("alternative", "two-sided")
        
        # Prepare data
        df = main_dataset.copy()
        df = df.dropna(subset=[group_column, value_column])
        
        if test_type == "t-test":
            # Independent t-test
            groups = df[group_column].unique()
            if len(groups) != 2:
                raise HTTPException(status_code=400, detail="T-test requires exactly 2 groups")
            
            group1_data = df[df[group_column] == groups[0]][value_column]
            group2_data = df[df[group_column] == groups[1]][value_column]
            
            # Run t-test
            t_stat, p_value = stats.ttest_ind(group1_data, group2_data)
            
            # Calculate effect size (Cohen's d)
            pooled_std = np.sqrt(((len(group1_data) - 1) * group1_data.var() + 
                                 (len(group2_data) - 1) * group2_data.var()) / 
                                (len(group1_data) + len(group2_data) - 2))
            cohens_d = (group1_data.mean() - group2_data.mean()) / pooled_std
            
            # Normality test
            _, normality_p1 = stats.shapiro(group1_data)
            _, normality_p2 = stats.shapiro(group2_data)
            
            # Equal variance test
            _, levene_p = stats.levene(group1_data, group2_data)
            
            result = {
                "test_type": "Independent t-test",
                "groups": list(groups),
                "statistics": {
                    "t_statistic": float(t_stat),
                    "p_value": float(p_value),
                    "significant": p_value < alpha,
                    "effect_size": float(cohens_d),
                    "effect_interpretation": interpret_cohens_d(cohens_d)
                },
                "assumptions": {
                    "normality_group1": normality_p1 > 0.05,
                    "normality_group2": normality_p2 > 0.05,
                    "equal_variance": levene_p > 0.05
                },
                "group_stats": {
                    "group1": {
                        "n": len(group1_data),
                        "mean": float(group1_data.mean()),
                        "std": float(group1_data.std()),
                        "se": float(group1_data.std() / np.sqrt(len(group1_data)))
                    },
                    "group2": {
                        "n": len(group2_data),
                        "mean": float(group2_data.mean()),
                        "std": float(group2_data.std()),
                        "se": float(group2_data.std() / np.sqrt(len(group2_data)))
                    }
                },
                "interpretation": f"t({len(group1_data) + len(group2_data) - 2}) = {t_stat:.3f}, p = {p_value:.3f}. " +
                                f"The difference between groups is {'statistically significant' if p_value < alpha else 'not statistically significant'} " +
                                f"(α = {alpha}). Effect size: {interpret_cohens_d(cohens_d)} (d = {cohens_d:.3f}).",
                "warnings": []
            }
            
            if normality_p1 < 0.05 or normality_p2 < 0.05:
                result["warnings"].append("Data may not be normally distributed. Consider non-parametric tests.")
            if levene_p < 0.05:
                result["warnings"].append("Variances may not be equal. Consider Welch's t-test.")
                
        elif test_type == "anova":
            # One-way ANOVA
            groups = df[group_column].unique()
            if len(groups) < 3:
                raise HTTPException(status_code=400, detail="ANOVA requires at least 3 groups")
            
            group_data = [df[df[group_column] == group][value_column] for group in groups]
            
            # Run ANOVA
            f_stat, p_value = stats.f_oneway(*group_data)
            
            # Calculate effect size (eta squared)
            ss_between = sum(len(data) * (data.mean() - df[value_column].mean())**2 for data in group_data)
            ss_total = sum((val - df[value_column].mean())**2 for val in df[value_column])
            eta_squared = ss_between / ss_total
            
            # Post-hoc test (Tukey's HSD)
            from statsmodels.stats.multicomp import pairwise_tukeyhsd
            tukey = pairwise_tukeyhsd(df[value_column], df[group_column], alpha=alpha)
            
            result = {
                "test_type": "One-way ANOVA",
                "groups": list(groups),
                "statistics": {
                    "f_statistic": float(f_stat),
                    "p_value": float(p_value),
                    "significant": p_value < alpha,
                    "effect_size": float(eta_squared),
                    "effect_interpretation": interpret_eta_squared(eta_squared)
                },
                "group_stats": {
                    group: {
                        "n": len(data),
                        "mean": float(data.mean()),
                        "std": float(data.std()),
                        "se": float(data.std() / np.sqrt(len(data)))
                    } for group, data in zip(groups, group_data)
                },
                "post_hoc": {
                    "tukey_results": str(tukey)
                },
                "interpretation": f"F({len(groups)-1}, {len(df)-len(groups)}) = {f_stat:.3f}, p = {p_value:.3f}. " +
                                f"There {'is' if p_value < alpha else 'is not'} a significant difference between groups " +
                                f"(α = {alpha}). Effect size: {interpret_eta_squared(eta_squared)} (η² = {eta_squared:.3f}).",
                "warnings": []
            }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/multivariate")
async def multivariate_analysis(request_data: dict):
    """Run multivariate analysis (PCA, correlation, regression)"""
    try:
        global main_dataset
        if main_dataset is None:
            raise HTTPException(status_code=400, detail="No dataset loaded")
        
        analysis_type = request_data.get("analysisType", "pca")
        
        if analysis_type == "pca":
            columns = request_data.get("columns", [])
            n_components = request_data.get("nComponents", 2)
            
            if len(columns) < 2:
                raise HTTPException(status_code=400, detail="PCA requires at least 2 variables")
            
            # Prepare data
            df = main_dataset[columns].dropna()
            
            # Standardize data
            scaler = StandardScaler()
            data_scaled = scaler.fit_transform(df)
            
            # Run PCA
            pca = PCA(n_components=min(n_components, len(columns)))
            pca_result = pca.fit_transform(data_scaled)
            
            # Calculate explained variance
            explained_variance = pca.explained_variance_ratio_
            cumulative_variance = np.cumsum(explained_variance)
            
            result = {
                "analysis_type": "Principal Component Analysis",
                "n_components": len(pca.components_),
                "explained_variance": explained_variance.tolist(),
                "cumulative_variance": cumulative_variance.tolist(),
                "loadings": pca.components_.tolist(),
                "feature_names": columns,
                "transformed_data": pca_result.tolist(),
                "summary": [
                    {"label": "Total Variance Explained", "value": f"{cumulative_variance[-1]*100:.1f}%"},
                    {"label": "Components", "value": str(len(pca.components_))},
                    {"label": "Original Features", "value": str(len(columns))}
                ],
                "interpretation": f"PCA reduced {len(columns)} features to {len(pca.components_)} components, " +
                                f"explaining {cumulative_variance[-1]*100:.1f}% of total variance.",
                "warnings": []
            }
            
            if cumulative_variance[-1] < 0.8:
                result["warnings"].append("Less than 80% of variance explained. Consider more components.")
                
        elif analysis_type == "correlation":
            columns = request_data.get("columns", [])
            
            if len(columns) < 2:
                raise HTTPException(status_code=400, detail="Correlation analysis requires at least 2 variables")
            
            # Prepare data
            df = main_dataset[columns].dropna()
            
            # Calculate correlation matrix
            corr_matrix = df.corr()
            p_values = calculate_correlation_pvalues(df)
            
            # Find significant correlations
            significant_correlations = []
            for i in range(len(columns)):
                for j in range(i+1, len(columns)):
                    corr_val = corr_matrix.iloc[i, j]
                    p_val = p_values.iloc[i, j]
                    if p_val < 0.05:
                        significant_correlations.append({
                            "variable1": columns[i],
                            "variable2": columns[j],
                            "correlation": float(corr_val),
                            "p_value": float(p_val),
                            "strength": interpret_correlation(corr_val)
                        })
            
            result = {
                "analysis_type": "Correlation Analysis",
                "correlation_matrix": corr_matrix.to_dict(),
                "p_values": p_values.to_dict(),
                "significant_correlations": significant_correlations,
                "summary": [
                    {"label": "Variables Analyzed", "value": str(len(columns))},
                    {"label": "Significant Correlations", "value": str(len(significant_correlations))},
                    {"label": "Strongest Correlation", "value": f"{max([abs(corr['correlation']) for corr in significant_correlations]):.3f}" if significant_correlations else "N/A"}
                ],
                "interpretation": f"Found {len(significant_correlations)} significant correlations among {len(columns)} variables.",
                "warnings": []
            }
            
        elif analysis_type == "regression":
            target_column = request_data.get("targetColumn")
            independent_columns = request_data.get("independentColumns", [])
            
            if not target_column or not independent_columns:
                raise HTTPException(status_code=400, detail="Regression requires target and independent variables")
            
            # Prepare data
            df = main_dataset[[target_column] + independent_columns].dropna()
            X = df[independent_columns]
            y = df[target_column]
            
            # Run regression
            model = LinearRegression()
            model.fit(X, y)
            y_pred = model.predict(X)
            
            # Calculate metrics
            r2 = r2_score(y, y_pred)
            mse = mean_squared_error(y, y_pred)
            rmse = np.sqrt(mse)
            
            # Calculate coefficients
            coefficients = dict(zip(independent_columns, model.coef_))
            
            result = {
                "analysis_type": "Linear Regression",
                "target_variable": target_column,
                "independent_variables": independent_columns,
                "model_performance": {
                    "r_squared": float(r2),
                    "adjusted_r_squared": float(1 - (1-r2)*(len(y)-1)/(len(y)-len(independent_columns)-1)),
                    "mse": float(mse),
                    "rmse": float(rmse)
                },
                "coefficients": coefficients,
                "intercept": float(model.intercept_),
                "equation": f"y = {model.intercept_:.3f} + " + " + ".join([f"{coef:.3f}*{var}" for var, coef in coefficients.items()]),
                "summary": [
                    {"label": "R²", "value": f"{r2:.3f}"},
                    {"label": "RMSE", "value": f"{rmse:.3f}"},
                    {"label": "Variables", "value": str(len(independent_columns))}
                ],
                "interpretation": f"Model explains {r2*100:.1f}% of variance in {target_column}. " +
                                f"Root mean squared error: {rmse:.3f}.",
                "warnings": []
            }
            
            if r2 < 0.3:
                result["warnings"].append("Low R² value. Model may not fit data well.")
            if len(df) < len(independent_columns) * 10:
                result["warnings"].append("Small sample size relative to number of predictors.")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bayesian")
async def bayesian_analysis(request_data: dict):
    """Run Bayesian analysis (estimation, A/B testing)"""
    try:
        global main_dataset
        if main_dataset is None:
            raise HTTPException(status_code=400, detail="No dataset loaded")
        
        analysis_type = request_data.get("analysisType", "estimation")
        column = request_data.get("column")
        samples = request_data.get("samples", 10000)
        
        if not column:
            raise HTTPException(status_code=400, detail="Please specify a column for analysis")
        
        # Prepare data
        df = main_dataset[column].dropna()
        
        if analysis_type == "estimation":
            # Bayesian parameter estimation (simplified)
            data_mean = df.mean()
            data_std = df.std()
            n = len(df)
            
            # Simulate posterior samples (simplified)
            posterior_mean = np.random.normal(data_mean, data_std/np.sqrt(n), samples)
            posterior_std = np.random.gamma(n/2, 2/(n*data_std**2), samples)
            
            # Calculate credible intervals
            mean_ci = np.percentile(posterior_mean, [2.5, 97.5])
            std_ci = np.percentile(posterior_std, [2.5, 97.5])
            
            result = {
                "analysis_type": "Bayesian Parameter Estimation",
                "parameter": column,
                "posterior_summary": {
                    "mean": {
                        "estimate": float(data_mean),
                        "credible_interval": mean_ci.tolist(),
                        "samples": posterior_mean.tolist()
                    },
                    "std": {
                        "estimate": float(data_std),
                        "credible_interval": std_ci.tolist(),
                        "samples": posterior_std.tolist()
                    }
                },
                "summary": [
                    {"label": "Posterior Mean", "value": f"{data_mean:.3f}"},
                    {"label": "95% CI (Mean)", "value": f"[{mean_ci[0]:.3f}, {mean_ci[1]:.3f}]"},
                    {"label": "Posterior Std", "value": f"{data_std:.3f}"}
                ],
                "interpretation": f"Bayesian estimation for {column}: mean = {data_mean:.3f} (95% CI: [{mean_ci[0]:.3f}, {mean_ci[1]:.3f}]), " +
                                f"standard deviation = {data_std:.3f} (95% CI: [{std_ci[0]:.3f}, {std_ci[1]:.3f}]).",
                "warnings": []
            }
            
        elif analysis_type == "ab-test":
            group_column = request_data.get("groupColumn")
            group1 = request_data.get("group1")
            group2 = request_data.get("group2")
            
            if not group_column or not group1 or not group2:
                raise HTTPException(status_code=400, detail="A/B testing requires group column and two group values")
            
            # Prepare data
            df = main_dataset[[column, group_column]].dropna()
            group1_data = df[df[group_column] == group1][column]
            group2_data = df[df[group_column] == group2][column]
            
            if len(group1_data) == 0 or len(group2_data) == 0:
                raise HTTPException(status_code=400, detail="One or both groups have no data")
            
            # Simplified Bayesian A/B test
            mean1, std1 = group1_data.mean(), group1_data.std()
            mean2, std2 = group2_data.mean(), group2_data.std()
            
            # Simulate posterior samples
            posterior1 = np.random.normal(mean1, std1/np.sqrt(len(group1_data)), samples)
            posterior2 = np.random.normal(mean2, std2/np.sqrt(len(group2_data)), samples)
            
            # Calculate difference
            diff = posterior2 - posterior1
            prob_better = np.mean(diff > 0)
            
            # Calculate credible intervals
            diff_ci = np.percentile(diff, [2.5, 97.5])
            percent_improvement = (diff / posterior1) * 100
            improvement_ci = np.percentile(percent_improvement, [2.5, 97.5])
            
            result = {
                "analysis_type": "Bayesian A/B Test",
                "groups": [group1, group2],
                "posterior_summary": {
                    "group1": {
                        "mean": float(mean1),
                        "std": float(std1),
                        "n": len(group1_data),
                        "samples": posterior1.tolist()
                    },
                    "group2": {
                        "mean": float(mean2),
                        "std": float(std2),
                        "n": len(group2_data),
                        "samples": posterior2.tolist()
                    },
                    "difference": {
                        "mean": float(diff.mean()),
                        "credible_interval": diff_ci.tolist(),
                        "samples": diff.tolist()
                    }
                },
                "probabilities": {
                    "prob_better": float(prob_better),
                    "prob_worse": float(1 - prob_better)
                },
                "improvement": {
                    "percent_improvement": float(percent_improvement.mean()),
                    "improvement_ci": improvement_ci.tolist()
                },
                "summary": [
                    {"label": "Probability B > A", "value": f"{prob_better:.1%}"},
                    {"label": "Mean Difference", "value": f"{diff.mean():.3f}"},
                    {"label": "95% CI (Diff)", "value": f"[{diff_ci[0]:.3f}, {diff_ci[1]:.3f}]"}
                ],
                "interpretation": f"Group {group2} has {prob_better:.1%} probability of being better than {group1}. " +
                                f"Mean difference: {diff.mean():.3f} (95% CI: [{diff_ci[0]:.3f}, {diff_ci[1]:.3f}]).",
                "warnings": []
            }
            
            if prob_better < 0.5 and prob_better > 0.1:
                result["warnings"].append("Inconclusive results. Consider larger sample size.")
            elif prob_better < 0.1:
                result["warnings"].append("Strong evidence that group A is better than group B.")
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def interpret_cohens_d(d: float) -> str:
    """Interpret Cohen's d effect size"""
    if abs(d) < 0.2:
        return "negligible"
    elif abs(d) < 0.5:
        return "small"
    elif abs(d) < 0.8:
        return "medium"
    else:
        return "large"

def interpret_eta_squared(eta2: float) -> str:
    """Interpret eta squared effect size"""
    if eta2 < 0.01:
        return "negligible"
    elif eta2 < 0.06:
        return "small"
    elif eta2 < 0.14:
        return "medium"
    else:
        return "large"

def interpret_correlation(r: float) -> str:
    """Interpret correlation coefficient"""
    if abs(r) < 0.1:
        return "negligible"
    elif abs(r) < 0.3:
        return "small"
    elif abs(r) < 0.5:
        return "medium"
    else:
        return "large"

def calculate_correlation_pvalues(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate p-values for correlation matrix"""
    n = len(df)
    p_values = pd.DataFrame(index=df.columns, columns=df.columns)
    
    for i in df.columns:
        for j in df.columns:
            if i == j:
                p_values.loc[i, j] = 1.0
            else:
                corr, p_val = stats.pearsonr(df[i], df[j])
                p_values.loc[i, j] = p_val
    
    return p_values

@router.post("/load-dataset")
async def load_dataset(file: UploadFile = File(...)):
    """Load main dataset for analysis"""
    try:
        global main_dataset
        
        if file.filename.endswith('.csv'):
            content = await file.read()
            main_dataset = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            content = await file.read()
            main_dataset = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        return {
            "message": "Dataset loaded successfully",
            "rows": len(main_dataset),
            "columns": len(main_dataset.columns),
            "column_info": [
                {
                    "name": col,
                    "type": str(main_dataset[col].dtype),
                    "missing": int(main_dataset[col].isnull().sum())
                } for col in main_dataset.columns
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset-info")
async def get_dataset_info():
    """Get information about loaded dataset"""
    global main_dataset
    
    if main_dataset is None:
        raise HTTPException(status_code=400, detail="No dataset loaded")
    
    return {
        "rows": len(main_dataset),
        "columns": len(main_dataset.columns),
        "column_info": [
            {
                "name": col,
                "type": str(main_dataset[col].dtype),
                "missing": int(main_dataset[col].isnull().sum()),
                "unique": int(main_dataset[col].nunique())
            } for col in main_dataset.columns
        ],
        "preview": main_dataset.head(10).to_dict('records')
    } 