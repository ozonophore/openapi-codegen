import { BrowserFieldDeploymentRule } from './rules/BrowserFieldDeploymentRule';
import { BrowserFrameworkDeploymentRule } from './rules/BrowserFrameworkDeploymentRule';
import { BundlerRule } from './rules/BundlerRule';
import { BundleSizeConfigRule } from './rules/BundleSizeConfigRule';
import { EdgeFunctionsDeploymentRule } from './rules/EdgeFunctionsDeploymentRule';
import { ExistingDependenciesRule } from './rules/ExistingDependenciesRule';
import { ExistingHttpClientsRule } from './rules/ExistingHttpClientsRule';
import { ExistingValidatorsRule } from './rules/ExistingValidatorsRule';
import { NetlifyLambdaRule } from './rules/NetlifyLambdaRule';
import { NodeTargetDeploymentRule } from './rules/NodeTargetDeploymentRule';
import { PackageJsonMetadataRule } from './rules/PackageJsonMetadataRule';
import { ReactNativeRule } from './rules/ReactNativeRule';
import { TreeShakingRule } from './rules/TreeShakingRule';
import { VercelEdgeRule } from './rules/VercelEdgeRule';
import type { DetectionRule } from './types';

export const DEFAULT_DETECTION_RULES: DetectionRule[] = [
    new PackageJsonMetadataRule(),
    new ExistingDependenciesRule(),
    new ExistingValidatorsRule(),
    new ExistingHttpClientsRule(),
    new TreeShakingRule(),
    new BundlerRule(),
    new ReactNativeRule(),
    new VercelEdgeRule(),
    new NetlifyLambdaRule(),
    new BundleSizeConfigRule(),
    new BrowserFrameworkDeploymentRule(),
    new EdgeFunctionsDeploymentRule(),
    new NodeTargetDeploymentRule(),
    new BrowserFieldDeploymentRule(),
];
