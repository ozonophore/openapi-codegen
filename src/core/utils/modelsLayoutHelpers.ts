import { ModelsLayout } from '../types/enums/ModelsLayout.enum';
import { ModelsMode } from '../types/enums/ModelsMode.enum';

/** Classes mode with bundle layout (default HEAD behavior: single models.ts). */
export const isClassesBundleLayout = (modelsMode?: ModelsMode, modelsLayout?: ModelsLayout): boolean =>
    modelsMode === ModelsMode.CLASSES && (modelsLayout ?? ModelsLayout.BUNDLE) === ModelsLayout.BUNDLE;

/** Classes mode with per-file layout (one Raw+Dto file per model.path). */
export const isClassesPerFileLayout = (modelsMode?: ModelsMode, modelsLayout?: ModelsLayout): boolean => modelsMode === ModelsMode.CLASSES && modelsLayout === ModelsLayout.PER_FILE;
