import Joi from "joi";

import { getErrorFieldsFromValidation } from "./getErrorFieldsFromValidation";
import { getKeyByMapValue } from "./getKeyByMapValue";

export function getCurrentErrorMessage(error: Joi.ValidationError, replaicingKeysMap: Map<string, string>) {
    const { path } = getErrorFieldsFromValidation(error)[0];
    const reverseKey = getKeyByMapValue(replaicingKeysMap, path);
    let currentMessage = error.message;
    if (reverseKey) {
        currentMessage = error.message.replace(path, reverseKey);
    }
    throw new Error(currentMessage);
}