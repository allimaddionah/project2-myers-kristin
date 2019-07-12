/**
 * notus v0.3.0
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 19 August, 2016
 *
 * Notus Interactive Demo Script.
 */

(function() {
    var myNotus = notus(),

        btnNotify = document.getElementById('btnNotify'),
        sourceEl = document.getElementById('example-source'),

        cbClosable = document.querySelector('input[type="checkbox"][name="closable"]'),
        cbAutoClose = document.querySelector('input[type="checkbox"][name="autoClose"]'),
        cbAnimate = document.querySelector('input[type="checkbox"][name="animate"]'),
        cbActionable = document.querySelector('input[type="checkbox"][name="actionable"]'),

        rdNotusType = document.querySelectorAll('input[type="radio"][name="notusType"]'),
        rdNotusPosition = document.querySelectorAll('input[type="radio"][name="notusPosition"]'),
        rdAlertType = document.querySelectorAll('input[type="radio"][name="alertType"]'),
        rdAnimationType = document.querySelectorAll('input[type="radio"][name="animationType"]'),

        notusType = "popup",
        notusPosition = "top-left",
        alertType = "none",
        animationType = "slide",
        closable = true,
        autoClose = true,
        animate = true,
        actionable = false,

        generatedNotusConfig,
        fnClone,
        fnRemoveDefaultConfig,
        fnGetSource,
        fnGenerateNotusConfig,
        i;

    fnClone = function(obj) {
        if (obj === null || typeof obj !== 'object')
            return obj;

        var temp = obj.constructor();

        for (var key in obj)
            temp[key] = fnClone(obj[key]);

        return temp;
    };

    fnRemoveDefaultConfig = function(config) {
        var key,
            defaultConfig = {
            notusType: 'popup',
            notusPosition: 'top-right',
            alertType: 'none',
            htmlString: false,
            closable: true,
            autoClose: true,
            autoCloseDuration: 3000,
            actionable: false,
            animate: true,
            animationType: 'slide',
            animationDuration: 300,
            animationFunction: 'ease-out',
            animationClass: {
                fixed: '',
                entry: '',
                exit: ''
            },
            themeClass: 'notus-material-light'
        };

        for (key in defaultConfig)
        {
            if (defaultConfig.hasOwnProperty(key) &&
                defaultConfig[key] === config[key])
            {
                delete config[key];
                if (key === "actionable")
                {
                    delete config["primaryAction"];
                    delete config["secondaryAction"];
                }
            }
        }
    };

    fnGetSource = function(config) {
        var copyConfig = fnClone(config),
            sourceConfig,
            primaryActionHandler = '',
            secondaryActionHandler = '',
            key;

        for (key in copyConfig)
        {
            if (copyConfig.hasOwnProperty(key) &&
                key === "actionable" &&
                copyConfig.actionable)
            {
                if (copyConfig.primaryAction)
                {
                    primaryActionHandler += String(copyConfig.primaryAction.actionHandler);
                    copyConfig.primaryAction.actionHandler = primaryActionHandler;
                }

                if (copyConfig.secondaryAction)
                {
                    secondaryActionHandler += String(copyConfig.secondaryAction.actionHandler);
                    copyConfig.secondaryAction.actionHandler = secondaryActionHandler;
                }
            }
        }

        sourceConfig = JSON.stringify(copyConfig, null, 4)      // Stringify with 4 space indentation
                           .replace(/"(\w+)"\s*:/g, '$1:')      // Remove quotes enclosing key names
                           .replace(/\"\\/g, '"')               // Replace escaped forward slash
                           //.replace(/\\\"/g, '"')               // Replace escaped quotes
                           .replace(/\"function/g, "function")  // Remove quotes preceding `function`
                           .replace(/}\"/g, "}")                // Remove quotes following `}`
                           .replace(/\\r\\n/g, "")              // Remove new-line characters `\r\n`
                           .replace(/</g, "&lt;")               // Escape tag brackets.
                           .replace(/>/g, "&gt;");

        return js_beautify(sourceConfig);
    };

    fnGenerateNotusConfig = function() {
        var notusConfig = {
            title: document.getElementById('notusTitle').value,
            message: document.getElementById('notusMessage').value,
            closable: closable,
            autoClose: autoClose,
            autoCloseDuration: 5000,
            notusType: notusType,
            notusPosition: notusPosition,
            alertType: alertType,
            animate: animate,
            animationType: animationType,
            animationDuration: 300,
            htmlString: true
        };

        notusConfig['actionable'] = cbActionable.checked;
        notusConfig['primaryAction'] = {
            'text': "<span class='glyphicon glyphicon-share-alt'></span> Reply",
            'actionHandler': function(e) {
                alert('Primary action clicked!');
            }
        };

        notusConfig['secondaryAction'] = {
            'text': "<span class='glyphicon glyphicon-time'></span> Snooze",
            'actionHandler': function(e) {
                alert('Secondary action clicked!');
                return true;
            }
        };

        if (notusType === 'snackbar')
        {
            delete notusConfig.title;

            notusConfig['primaryAction'].text = 'CONFIRM';
            notusConfig['secondaryAction'].text = 'UNDO';
        }

        if (animationType === 'custom')
        {
            notusConfig['animationClass'] = {
                fixed: 'animated',
                entry: 'flipInX',
                exit: 'flipOutX'
            };
        }

        fnRemoveDefaultConfig(notusConfig);
        sourceEl.innerHTML = fnGetSource(notusConfig);
        Prism.highlightElement(sourceEl);

        return notusConfig;
    };

    for (i = 0; i < rdNotusType.length; i++)
    {
        rdNotusType[i].onchange = function(e) {
            var supportPositions,
                j;

            if (this.checked)
                notusType = this.value;

            supportPositions = document.querySelectorAll('input[type="radio"][data-supported]');

            for (j = 0; j < supportPositions.length; j++)
            {
                if (notusType == 'popup')
                {
                    supportPositions[j].disabled = (supportPositions[j].dataset.supported === 'ts');
                    document.querySelectorAll('input[type="radio"][data-supported="p"]')[0].checked = true;
                    notusPosition = 'top-left';
                }
                else
                {
                    supportPositions[j].disabled = (supportPositions[j].dataset.supported === 'p');
                    document.querySelectorAll('input[type="radio"][data-supported="ts"]')[(notusType === 'snackbar') ? 1 : 0].checked = true;
                    notusPosition = (notusType === 'snackbar') ? 'bottom' : 'top';
                }
            }

            document.getElementById('notusTitle').disabled = (notusType === 'snackbar');

            generatedNotusConfig = fnGenerateNotusConfig();
        };
    }

    for (i = 0; i < rdNotusPosition.length; i++)
    {
        rdNotusPosition[i].onchange = function(e) {
            if (this.checked)
                notusPosition = this.value;

            generatedNotusConfig = fnGenerateNotusConfig();
        }
    }

    for (i = 0; i < rdAlertType.length; i++)
    {
        rdAlertType[i].onchange = function(e) {
            if (this.checked)
                alertType = this.value;

            generatedNotusConfig = fnGenerateNotusConfig();
        }
    }

    for (i = 0; i < rdAnimationType.length; i++)
    {
        rdAnimationType[i].onchange = function(e) {
            if (this.checked)
                animationType = this.value;

            generatedNotusConfig = fnGenerateNotusConfig();
        };
    }

    cbClosable.onchange = function(e) {
        closable = this.checked;
        generatedNotusConfig = fnGenerateNotusConfig();
    };

    cbAutoClose.onchange = function(e) {
        autoClose = this.checked;
        generatedNotusConfig = fnGenerateNotusConfig();
    };

    cbAnimate.onchange = function(e) {
        for (i = 0; i < rdAnimationType.length; i++)
        {
            rdAnimationType[i].checked = false;
            rdAnimationType[i].disabled = !this.checked;
        }

        if (this.checked)
        {
            rdAnimationType[0].checked = true;
            animationType = "slide";
        }

        animate = this.checked;
        generatedNotusConfig = fnGenerateNotusConfig();
    };

    cbActionable.onchange = function(e) {
        actionable = this.checked;
        generatedNotusConfig = fnGenerateNotusConfig();
    };

    btnNotify.onclick = function(e) {
        e.preventDefault();

        if (!generatedNotusConfig)
            generatedNotusConfig = fnGenerateNotusConfig();

        myNotus.send(generatedNotusConfig);
    };
})();
