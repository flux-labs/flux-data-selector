var FluxDataSelectorUI = (function(ds, selectorId) {

var selectorIdString = '#' + selectorId;

ds.setOnInitial(initialView);
ds.setOnLogin(fluxView);
ds.setOnExamples(populateExamples);
ds.setOnProjects(populateProjects);
ds.setOnKeys(populateKeys);
ds.setOnValue(onValueChange);

ds.init();

function initialView() {
    var template =
        '<div class="ui form">' +
            '<div class="two fields">' +
                '<div class="six wide field">' +
                    '<label>Example Data</label>' +
                    '<div class="ui fluid search selection dropdown examples-selection-dropdown">' +
                        '<i class="dropdown icon"></i>' +
                        '<div class="default text">Select Examples</div>' +
                        '<div class="menu">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="two wide field">' +
                    '<label>&nbsp;</label>' +
                    '<button id="useFluxButton" class="teal ui button">Use your own data</button>' +
                '</div>' +
            '</div>' +
        '</div>'
    ;

    $(selectorIdString).html(template);

    $(selectorIdString + ' #useFluxButton').click(function() {
        ds.login();
    });

    ds.showExamples();
}

function populateExamples(examples) {
    for (label in examples) {
        $('.examples-selection-dropdown > div.menu')
            .append('<div class="item">'+label+'</div>');
    }
    $('.examples-selection-dropdown').dropdown({
        action: 'activate',
        onChange: function(value, text, $selectedItem) {
            ds.selectExample(text);
        }
    });
}

function fluxView() {
    template =
        '<div class="ui form">' +
            '<div class="three fields">' +
                '<div class="three wide field">' +
                    '<label>Project</label>' +
                    '<div class="ui fluid search selection dropdown projects-selection-dropdown">' +
                        '<i class="dropdown icon"></i>' +
                        '<div class="default text">Select Project</div>' +
                        '<div class="menu">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="three wide field">' +
                    '<label>Data Key</label>' +
                    '<div class="ui fluid search selection dropdown data-keys-selection-dropdown">' +
                        '<i class="dropdown icon"></i>' +
                        '<div class="default text">Select Data Key</div>' +
                        '<div class="menu">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="two wide field">' +
                    '<label>&nbsp;</label>' +
                    '<button id="logoutFluxButton" class="red ui button">Logout</button>' +
                '</div>' +
            '</div>' +
        '</div>'
    ;

    $(selectorIdString).html(template);

    $('#logoutFluxButton').click(function() {
        ds.logout();
    });

    ds.showProjects();
}

function populateProjects(projectsPromise) {
    $('.projects-selection-dropdown > div.menu *').remove();
    projectsPromise
        .then(function(projects) {
            projects.entities.map(function(item) {
                $('.projects-selection-dropdown > div.menu')
                    .append('<div class="item" data-value='+item.id+'>'+item.name+'</div>');
            });
            $('.projects-selection-dropdown').dropdown({
                action: 'activate',
                onChange: function(value, text, $selectedItem) {
                    ds.selectProject(value);
                }
            });
        });
}

function populateKeys(keysPromise) {
    $('.data-keys-selection-dropdown > div.menu *').remove();
    keysPromise
        .then(function(keys) {
            keys.entities.map(function(item) {
                $('.data-keys-selection-dropdown > div.menu')
                    .append('<div class="item" data-value='+item.id+'>'+item.label+'</div>');
            });
            $('.data-keys-selection-dropdown').dropdown({
                action: 'activate',
                onChange: function(value, text, $selectedItem) {
                    ds.selectKey(value);
                }
            });
        })
}

function onValueChange(valuePromise) {
    valuePromise
        .then(function(value) {
            console.log('Retrieved Value: ' + value);
        });
}

});
