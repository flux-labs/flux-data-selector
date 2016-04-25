var ds = new FluxDataSelector('0f823656-da5e-4c8e-a704-91ab524aac42', 'http://localhost:8000');
ds.setOnReady(function() { fluxView(); });
ds.init();
ds.setExampleData('example data 1', '{ fish: 2 }');
ds.setExampleData('example data 2', '{ fish: 3 }');
initialView();

function initialView() {
    if (!ds.isAuthed()) {
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

        $('#flux-data-selector').html(template);

        var list = ds.listExampleData();

        for (label in list) {
            $('.examples-selection-dropdown > div.menu')
                .append('<div class="item">'+label+'</div>');
        }
        $('.examples-selection-dropdown').dropdown({
            action: 'activate',
            onChange: function(value, text, $selectedItem) {
                ds.selectExampleData(text);
                ds.getExampleData(text);
                ds.getData(function(data) { console.log(data); });
            }
        });

        $('#flux-data-selector #useFluxButton').click(function() {
            ds.login();
        });
    }
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

    $('#flux-data-selector').html(template);

    ds.listFluxProjects()
        .then(function(projects) {
            projects.entities.map(function(item) {
                $('.projects-selection-dropdown > div.menu')
                    .append('<div class="item" data-value='+item.id+'>'+item.name+'</div>');
            });
            $('.projects-selection-dropdown').dropdown({
                action: 'activate',
                onChange: function(value, text, $selectedItem) {
                    var projectId = value;
                    $('data-keys-selection-dropdown > div.menu *').remove();
                    ds.listFluxDataKeys(projectId)
                        .then(function(cells) {
                            cells.entities.map(function(item) {
                                $('.data-keys-selection-dropdown > div.menu')
                                    .append('<div class="item" data-value='+item.id+'>'+item.label+'</div>');
                            });
                            $('.data-keys-selection-dropdown').dropdown({
                                action: 'activate',
                                onChange: function(value, text, $selectedItem) {
                                    var cellId = value;
                                    ds.selectFluxData(projectId, cellId);
                                    ds.getData(function(data) {
                                        console.log(data);
                                    });
                                }
                            });
                        })
                }
            });
        });

    $('#logoutFluxButton').click(function() {
        ds.logout();
        initialView();
    });
}
