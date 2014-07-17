Большая просьба, помогите с переводом. Моё умение писать по-английски оставляет желать лучшего, так что сам не справлюсь.

Сборщик модулей
===============

Usage
-----

### Standalone
You can use this tool from console running
    
    > node <path/to/jsc-linker>/run/jsclinker <path/to/project/config.json>
    
or

    > node_modules/.bin/jsclinker <path/to/project/config.json>
    
or install it globally (npm install -g jsc-linker), and use

    > jsclinker <path/to/project/config.json>
    
### As grunt plugin
Or you can use it as grunt plugin
    
    grunt.initConfig({
        "jsc-linker": { 
            one_target: { src: "path/to/project/config.json" },
            other_target: { src: "path/to/other/project/config.json" },
        }
    });
    grunt.loadNpmTasks('jsc-linker');    
    

Входные данные
--------------

### {name}.json
Файл описания модуля. В нём указываются пути используемые в модуле, перечень модулей которые требуется собрать (входные точки модулей). Формат описания такой:

    {
        "paths": {
            "app": "{root}/js/app",
            "core": "{root}/js/core",
            "lib": "{root}/js/lib",
            "test": "{root}/js/test",
            "tpl": "{root}/tpl",
            "i18n": "{root}/i18n"
        },
        "build": [
            "{lib}/global",
            "{app}/app"
        ]
    }

При сборке, если указан путь **i18n**, по этому пути ищутся каталоги с двухбуквенными именами языков, а в них .json файлы переводов и собираются в отдельный js файл. Это проделывается только для последней цели сборки (в данном примере - {app}/app).

### JS-файлы
По умолчанию ко всем путям добавляется сначала _.min.js_, если такого файла не оказывается, то просто _.js_
В js-файлах ищутся директивы в формате //#имя_директивы опции_директивы. Например:

- **//#include {lib}/sugar/array** - добавляет lib/sugar/array.js в список файлов для построения библиотеки
- **//#import {app}/data/gates/user#user as userGate** - импортирует переменную user из файла app/data/gates/user.js в локальное окружение текущего файла под именем userGate

### Шаблоны
В файлах шаблонов Handlebars используется несколько другой синтаксис директив прекомпилятора: {{!#имя_директивы опции_директивы}}. Например:

- **{{!#load {app}/ui/drop-down-select}}** - добавит в основной модуль файл app/ui/drop-down-select.js
- **{{!#import {app}/hardcore/roles#userRoles}}** - импортирует переменную userRoles из файла app/hardcore/roles в локальное окружение скомпилированного шаблона

Результат прекомпиляции
-----------------------

### {name}.module.json
Файл описания модуля. Содержит полную информацию о модуле в том числе листинг (слегка обработанный) всех файлов входящих в состав модуля. Получается после обработки директив прекомпилятора. Является основой работы всех генераторов.

### {name}.module.js
Непосредственно сам файл модуля. Включает в себя все необходимые скрипты и скомпилированные шаблоны. В состав модуля не входят библиотеки и переводы. Шаблоны сохраняются в локальную для модуля переменную TPL.

### {name}.lib.js
Библиотека модуля. Содержит конкатенацию всех библиотечных скриптов используемых в модуле в порядке использования.

### {name}.i18n.js
Библиотека переводов. Содержит 1 глобальную переменную I18N содержащую словарь всех переводов.

Директивы прекомпилятора
------------------------

### include
Добавляет указанный файл в очередь создания библиотеки

- требует и принимает только путь

### load
Добавляет указанный файл в очередь создания модуля

- требует и принимает только путь

### require
Непосредственно вставляет содержимое указанного файла в позицию директивы. Единственная на данный момент дирректива для которой важно местоположение в файле.

- требует и принимает только путь

### template
Добавляет указанный файл в очередь компиляции шаблонов и включения в модуль.

- требует и принимает только путь

### export
Делает переменную доступной для импорта из других файлов

- требует путь
- требует имя переменной
- опционально можно задать внешнее имя переменной

_Синтаксис: <путь>#<локальное имя>[ as <внешнее имя>]_

### global
Экспортирует переменную в глобальное пространство имён. (не работает для nodejs в котором отсутствует возможность менять глобальное пространство имён)

- требует имя переменной
- опционально можно указать внешнее имя переменной

_Синтаксис: <локальное имя>[ as <внешнее имя>]_

### external
Экспортирует переменную в локальное пространство модуля и делает её доступной для импорта другим модулем

- требует имя переменной
- опционально можно указать внешнее имя переменной

_Синтаксис: <локальное имя>[ as <внешнее имя>]_

### internal
Экспортирует переменную в локальное пространство модуля

- требует имя переменной
- опционально можно указать внешнее имя переменной

_Синтаксис: <локальное имя>[ as <внешнее имя>]_

### import
Загружает переменную из указанного файла в локальное окружение текущего файла под указанным именем

- требует путь
- требует имя переменной
- опционально можно задать локально имя переменной

_Синтаксис: <путь>#<внешнее имя>[ as <локальное имя>]_

### uses
Загружает все переменные из указанного файла в локальную переменную

- требует путь
- требует имя переменной

_Синтаксис: <путь>#<локальное имя>_

### refs
_Не реализовано_
_Необходимость под вопросом_

Указывает что данный файл использует переменную экспортированную в локальное окружение модуля или в глобальное пространство имён. Меняет порядок включение модулей таким образом чтобы экспорт переменной происходил до включения текущего файла (если это возможно), даёт дополнительные возможности валидации кода, но нарушает общую концепцию при которой мы всегда напрямую указываем имя файла, откуда берётся переменная, так что реализация под вопросом.

- требует и принимает только имя переменной

### module
_Не реализовано_
_Необходимость под вопросом_

Маркирует файл как входную точку модуля. Идея заключалась в том, что при включении такого файла, вместо простого включения, он будет скомпилирован как модуль по всем правилам, а затем будет уже подключен весь модуль. Но в данной концепции огромное количество подводных камней, плюс к тому грамотная настройка linker.json и путей линковки полностью решает данную задачу.

- не принимает никаких аргументов

### test
Указывает ссылку на файл тестов для данного подмодуля. Формирует файл linker.test.json (тот же linker.json, но собирает не модуль а тесты)

- требует и принимает только путь

### override
Переназначает пути в директивах. Было придумано для тестов, чтобы заменять реальные файлы отладочными версиями.

- требует путь который заменяем
- требует путь на который требуется заменять

_Синтаксис: <реальный путь>#<отладочный путь>_

Написание своих директив
------------------------

Файлы директив лежат в каталоге directives. Директивы требуется вручную подключать в файле directives/directives.js Каждая директива представляет собой набор из 3х методов:

### before(file, current, root, reg)
- **file** - содержимое файла
- **current** - описание текущего файла
- **root** - флаг того что текущий файл является точкой входа модуля
- **reg** - регулярное выражение для поиска директив

данный метод предназначен для предварительной обработки файла. Возвращаемое значение принимается за новое содержимое файла. Если оно отличается от предыдущего, то стадия предварительной обработки перезапускается.

### line(attr, root)
- **attr** - аргументы директивы
- **root** - флаг того что текущий файл является точкой входа модуля

данный метод предназначен для предварительной обработки аргументов директивы. Возвращаемое значение записывается в соответствующий массив в описании текущего файла

### after(data, controls)
- **data** - массив данных собраный после обработки всех вхождений директивы
- **controls.parseQueue(files, cb)** - загружает указанный массив файлов и добавляет их в соответствующие очереди прекомпиляции (если иное не указано в cb(file) - коллбек функция вызываемая для каждого загруженного файла). Вместо колбека можно указать имя очереди прекомпиляции в которую добавлять загруженный файл.
- **controls.add(storage, data)** - добавляет данные (data) в очередь прекомпиляции (storage)

данный метод предназначен для обработки массива данных собранных при обработке всех вхождений директивы в файле


Как этим всем пользоваться и для чего оно нужно.
------------------------------------------------

Данная система нужна в первую очередь чтобы быстро и безошибочно определять места реализации различных функций и хранения переменных. За счёт непосредственного указания директив сборки в каждом файле, все внешние зависимости легко контролировать и отслеживать.
Каждый файл при компиляции заключается в отдельное замыкание, таким образом все объявленные переменные являются локальными, если с помощью директив не указана другая область видимости.

### Импорт/экспорт переменных
Так как все переменные по умолчанию являются локальными, для того чтобы использовать объявленную в одном файле переменную в другом файле, нужно в одном файле пометить её для экспорта (или сделать глобальной), а в другом указать директиву импорта этой переменной. При импорте можно указать локальное имя переменной, через которое она будет доступна к данном файле. (Лучше не использовать переименование на уровне директив, т.к. IDE Webstorm не понимает подобных фокусов и будет показывать что переменная неопределена, и не сможет выполнять автодополнение)

### Логирование
Для упрощения процесса отладки предусмотренно логирование процеса инициализации каждого отдельного файла и всего модуля вцелом. Для этого используется функция runLogger, которая доступна в каждом файле и имеет привязку к его имени (при запуске runLogger автоматически указывается в каком именно файле произошёл вызов)

### Кольца
Если в структуре присутствуют кольца (файл **a** использует файл **б**, файл **б** использует файл **а**), то сборщик модулей выдаст ошибку компиляции с указанием пути кольца. Подобные кольца нужно избегать. Решить данный конфликт на стадии компиляции не представляется возможным, так что структуру проекта нужно продумывать таким образом, чтобы колец не возникало.

### Области видимости и последовательность исполнения
- В первую очередь загружается файл(ы) библиотеки в глобальную область видимости. Библиотечные функции доступны из любой части проекта.
- Далее загружается библиотека переводов.
- Стартуют файлы модуля в порядке линковки.
- Происходит инициализация шаблонов. (Т.к. на момент старта файлов модуля шаблоны не определены нельзя обращаться к шаблонам непосредственно в момент инициализации. Это не составляет большой проблемы, т.к. обращаться к документу в любом случае нельзя пока не произойдёт событие $(document).ready)

### Отладка
Т.к. конечный файл модуля не является прямой конкатенацией исходных файлов, построить SourceMap не представляется возможным (по крайней мере я не знаю как это делается), вместо этого в начале каждого файла ставится комментарий с типом и именем этого файла для удобства нахождения исходника. (В продакшне все комментарии вырезаются, так что для отладки лучше использовать runLogger - он покажет имя файла в котором был вызван)

### Шаблоны
Шаблонизатор Handlebars использует своё собственное пространство имён, так что даже глобальные переменные не видны в шаблоне. Все необходимые переменные должны быть импортированы напрямую с помощью директив import/uses или косвенно в функции-обёртке используемой для вывода шаблонов. Все шаблоны доступны через переменную TPL. Имя шаблона совпадает с путём указанным в директиве без расширения .tpl ( **{tpl}/ui/page.tpl** будет доступен как **{tpl}/ui/page**)

### Тестирование
Директивы **#test** указывают лишь входную точку файла тестов. Сам файл тестов является таким же модулем как и сам проект. Если файл **{app}/some/file** указывает, что его тесты лежат в **{test}/some/file**, то в файле **{test}/some/file** нужно подключить файл **{app}/some/file** - без этого тест не увидит данный файл. Хотя оба файла ссылаются друг на друга, в данном случае это не порождает кольцо, т.к. директива **#test** не выполняет подключение файла к проекту, а лишь указывает дополнительную цель для сборки.