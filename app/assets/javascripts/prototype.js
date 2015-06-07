var sdk = new CitySDK();
var census = sdk.modules.census;

census.enable("fb3cabb854588d0c4a3e0093d68cf8618fc9ff69");

// Holds all valid CitySDK variables with descriptions
var variables = {};

census.getACSVariableDictionary("acs5", 2010, function (res) {
    variables = res.variables;
    load();
    /*return;
    var data = res.variables;
    var newData = {};
    for(var key in data)
    {
        if (key == "for" || key == "in")
            continue;

        // Error Margins
        if (key[key.length - 1] == "M")
            continue;

        if (data[key].label.indexOf("Moved from different state") == -1)
            continue;

        var keyData = key.split("_");
        var concept = keyData[0];
        var code = 0;
        if (keyData.length > 1)
            code = parseInt(keyData[1].substring(0,3));

        if (newData[concept] == null)
        {
            newData[concept] = {};
        }

        newData[concept][code] = data[key];
    }

    out.innerHTML += JSON.stringify(newData, null, 1);*/
});

function load()
{
    $("#yearselect").on("change", function () {
        doRequest();
    });

    var movedToDifferentCounty = [
        "B07401_049E",
        "B07401_050E",
        "B07401_051E",
        "B07401_052E",
        "B07401_053E",
        "B07401_054E",
        "B07401_055E",
        "B07401_056E",
        "B07401_057E",
        "B07401_058E",
        "B07401_059E",
        "B07401_060E",
        "B07401_061E",
        "B07401_062E",
        "B07401_063E",
        "B07401_064E"
    ];

    var movedToDifferentState = [
        "B07401_065E",
        "B07401_066E",
        "B07401_067E",
        "B07401_068E",
        "B07401_069E",
        "B07401_070E",
        "B07401_071E",
        "B07401_072E",
        "B07401_073E",
        "B07401_074E",
        "B07401_075E",
        "B07401_076E",
        "B07401_077E",                                             
        "B07401_078E",
        "B07401_079E",                                             
        "B07401_080E"
    ];

    var movedFromDifferentCounty = [
        "B07001_049E",
        "B07001_050E",
        "B07001_051E",
        "B07001_052E",
        "B07001_053E",
        "B07001_054E",
        "B07001_055E",
        "B07001_056E",
        "B07001_057E",
        "B07001_058E",
        "B07001_059E",
        "B07001_060E",
        "B07001_061E",
        "B07001_062E",
        "B07001_063E",
        "B07001_064E"
    ];

    var movedFromDifferentState = [
        "B07001_065E",
        "B07001_066E",
        "B07001_067E",
        "B07001_068E",
        "B07001_069E",
        "B07001_070E",
        "B07001_071E",
        "B07001_072E",
        "B07001_073E",
        "B07001_074E",
        "B07001_075E",
        "B07001_076E",
        "B07001_077E",                                             
        "B07001_078E",
        "B07001_079E",                                             
        "B07001_080E"
    ];

    generateRow(movedFromDifferentCounty, "Moved From another county");
    generateRow(movedFromDifferentState, "Moved From another state");
    generateTotalRow("inboundTotal", "Total Inbound");

    generateRow(movedToDifferentCounty, "Moved To another county");
    generateRow(movedToDifferentState, "Moved To another state");
    generateTotalRow("outboundTotal", "Total Outbound");
    generateTotalRow("netTotal", "Net Change");

    // Starting data
    doRequest();

    function generateRow(array, label)
    {
        var row = $("<tr>");
        row.append($('<td>').text(label));
        for (var i = 0; i < array.length; i++)
        {
            row.append($('<td>').attr("id", array[i]));
        }
        $('#table-body').append(row);
    }

    function generateTotalRow(idprefix, label)
    {
        var row = $('<tr class="totalrow">');
        row.append($('<td>').text(label));
        for (var i = 0; i < 16; i++)
        {
            row.append($('<td>').attr("id", idprefix + i));
        }
        $('#table-body').append(row);
    }


    function doRequest()
    {
        var request = {
            "level": "county",
            "year": $("#yearselect").val(),
            // Apperently zip code doesn't matter as long
            // as it in correct "level"
            "zip": "27408",
            "sublevel": false,
            "variables": [
            ]
        };

        var inboundTotal = [];
        var outboundTotal = [];
        // init total arrays
        for (var i = 0; i < 16; i++)
        {
            inboundTotal[i] = 0;
            outboundTotal[i] = 0;
        }

        // We need to break request into two to avoid max number of variables
        var request2 = $.extend({}, request);
        request.variables = movedToDifferentCounty.concat(movedToDifferentState);
        census.APIRequest(request, handle);

        request2.variables = movedFromDifferentCounty.concat(movedFromDifferentState);
        census.APIRequest(request2, handle);

        function handle (res) {
            var data = res.data[0];
            for (var key in data)
            {
                $("#" + key).text(data[key]);

                var id = Math.max(movedToDifferentCounty.indexOf(key),
                                  movedToDifferentState.indexOf(key));
                if (id != -1)
                {
                    outboundTotal[id] += parseInt(data[key]);
                }
                else
                {
                    id = Math.max(movedFromDifferentCounty.indexOf(key),
                                  movedFromDifferentState.indexOf(key));

                    if (id != -1)
                    {
                        inboundTotal[id] += parseInt(data[key]);
                    }
                }
            }
            updateTables();
        }

        function updateTables() {
            for (var i = 0; i < 16; i++)
            {
                $('#outboundTotal' + i).text(outboundTotal[i]);
                $('#inboundTotal' + i).text(inboundTotal[i]);
                $('#netTotal' + i).text(inboundTotal[i] - outboundTotal[i]);
            }                        
        }
    }
}