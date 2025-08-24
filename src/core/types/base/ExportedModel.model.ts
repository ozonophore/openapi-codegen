import { Model } from "../shared/Model.model";

/**
 * @param name: The name of the model
 * @param alias: The alias of the model(when there are several similar models in the one specification)
 * @param path: The name of the file witch contains this model
 * @param package: The relative location of this service
 * @param enum: Then flag for mark an enum
 * @param useUnionTypes: Use union types instead of enums
 * @param enums: Then flag for mark an enums
 */
export type ExportedModel = Pick<
  Model,
  'name' | 'alias' | 'path'
> & {
  package: string;
  enum: boolean;
  enums: boolean;
  useUnionTypes: boolean;
};