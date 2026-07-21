## Purpose

Yup boolean schema coercion when `needsCoercion` is set, parity with Zod/Joi branches.

## Requirements

### Requirement: Yup boolean coercion when needsCoercion
При `validationLibrary: "yup"` и свойстве с `needsCoercion`, целевой тип которого boolean, генератор MUST эмитить Yup-схему с coerce/transform string→boolean, а не голый `yup.boolean()` без преобразования.

#### Scenario: boolean property with needsCoercion
- **WHEN** property помечено `needsCoercion` к boolean и выбрана Yup
- **THEN** в сгенерированной схеме присутствует transform/coerce, допускающий строковый вход (паритет с Zod/Joi ветками проекта)

#### Scenario: boolean without needsCoercion unchanged
- **WHEN** boolean property без `needsCoercion`
- **THEN** эмитится обычный `yup.boolean()` без лишнего transform
