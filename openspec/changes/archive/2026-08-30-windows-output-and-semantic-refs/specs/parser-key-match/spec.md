## ADDED Requirements

### Requirement: Intern-сравнение ключей — общая орфография, не path.resolve
Система MUST сравнивать файловые ключи парсера `$Refs` одним helper intern-ключа (свёртка слешей `\` → `/`, декодирование percent-encoding, регистр буквы диска). `RefLookup` и `expandOpenApiRefsForSemanticDiff` MUST оба вызывать этот helper. Helper MUST NOT использовать `path.resolve`, `path.join` или `path.normalize`, чтобы определять равенство. Совпадение MUST означать intern-орфографию того же открытого файла, а не другой basename на диске.

#### Scenario: Ключ парсера с обратным слешем совпадает с intern-орфографией со слешем `/`
- **WHEN** один ключ — `C:\proj\schemas\User.yaml`, а другой — `C:/proj/schemas/User.yaml`
- **THEN** intern-сравнение ключей MUST считать их одним и тем же файлом

#### Scenario: Регистр буквы диска и percent-encoding
- **WHEN** один ключ — `c:/proj/api.yaml`, а другой — `C:/proj/api.yaml`, или одна сторона использует `%20` для пробела в том же открытом файле
- **THEN** intern-сравнение ключей MUST считать их одним и тем же файлом

#### Scenario: Разные файлы не intern-равны
- **WHEN** в intern-таблице есть `/home/dev/other/Pet.yaml`, а кандидат — `/home/dev/schemas/Pet.yaml`
- **THEN** intern-сравнение ключей MUST NOT считать их одним и тем же файлом
