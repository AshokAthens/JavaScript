/*
 '{"Refinements":{"NameValueList":[{"Name":"Megapixels","Value":["5.0 to 5.9 MP"]}]},' +
 '"Keyword":"camera","Start":1,"Rows":10,"SortOrder":null,"Location":"US","Realm":null,"Store":null,"User":null}';
 */
function constructSearchRequestJson (queryParams, pageNumber, itemsPerPage, category, refinementsChosen, showHistogram,
sortOrder, showSellerInfo, showDebug, zipCode, userCountry) {
    var requestObject = {
        Refinements: getRefinements(refinementsChosen),
        Keyword: getQueryParam(queryParams, "keyword"),
        Start: pageNumber,
        Rows: itemsPerPage,
        SortOrder: sortOrder,
        Location: userCountry,
        Realm: getQueryParam(queryParams, "realm"),
        RealmAnId: getQueryParam(queryParams, "realmAnId"),
        Store: null,
        User: getQueryParam(queryParams, "user"),
        ShowHistogram: showHistogram,
        ShowSellerInfo: showSellerInfo,
        Debug: showDebug,
        PostalCode: zipCode,
        SBSessionToken: getQueryParam(queryParams, "sbtoken")
    };

    if (category) {
        requestObject.CategoryId = [category];
    } else {
        var unspsc = getQueryParam(queryParams, "uncc");
        if (!nullOrEmptyString(unspsc)) {
            requestObject.CategoryId = [unspsc];
            requestObject.CategoryDomain = "UNSPSC";
        }
    }

    //console.log("request Object" +  angular.toJson(requestObject));
    return angular.toJson(requestObject);
}

function constructCartedItemUpdate (item, storeInfo, realm, realmAnId, token, user, isInAPC)
{

    var outItem = {};
    outItem["ItemId"] = item.ItemId;

    if (item.SelectedVariation!=null) {

        outItem["SelectedVariation"] = item.SelectedVariation;
    }

    outItem["Supplier"] = item.Supplier;

    var requestObject = {
        Item: outItem,
        SupplierInfo: storeInfo,
        RealmAnId: realmAnId,
        SBSessionToken: token,
        User: user,
        Realm: realm,
        IsFromAPC: isInAPC
    };
    return angular.toJson(requestObject);
}


function constructItemDetailsRequestJson (user, realm, realmAnId, itemId, sbtoken) {
    var requestObject = {
        ItemId: itemId,
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };

    return angular.toJson(requestObject);
}

function constructShippingRequestJson (itemId, country, postalCode, sbtoken, user, realm, realmAnId) {
    if (nullOrEmptyString(country)) {
        country = "US";
    }

    var requestObject = {
        ItemId: itemId,
        DestinationCountryCode: country,
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        SBSessionToken: sbtoken
    };

    if (postalCode != null) {
        requestObject['DestinationPostalCode'] = postalCode;
    }
    return angular.toJson(requestObject);
}

function constructItemVariationIDRequestJson (user, realm, realmAnId, itemId, sbtoken) {
    var requestObject = {
        ItemId: itemId,
        ResponseType: "VariationId",
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };

    return angular.toJson(requestObject);
}

function constructItemDescriptionRequestJson (user, realm, itemId, sbtoken, realmAnId) {
    var requestObject = {
        ItemId: itemId,
        ResponseType: "Description",
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };

    return angular.toJson(requestObject);
}

function constructImportRestrictionsRequestJson (user, realm, realmAnId, sbtoken, fileContents) {
    var requestObject = {
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken,
        FileContents: fileContents
    };

    return angular.toJson(requestObject);
}

function constructTOURequest (user, realm, realmAnId, sbtoken) {
    var requestObject = {
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };
    return angular.toJson(requestObject);
}

function constructExportRestrictionsRequestJson (user, realm, realmAnId, sbtoken) {
    var requestObject = {
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };

    return angular.toJson(requestObject);
}

function constructCommodityMappingRequestJson (user, realm, realmAnId, sbtoken) {
    var requestObject = {
        User: user,
        Realm: realm,
        RealmAnId: realmAnId,
        Location: "US",
        SBSessionToken: sbtoken
    };

    return angular.toJson(requestObject);
}

function getRefinements (refinements) {
    if (refinements) {
        var refinementList = [];
        angular.forEach(refinements, function (value, key) {
            var list = [];
            angular.forEach(value.value, function (innerValue, innerKey) {
                if (innerValue) {
                    list.push(innerKey);
                }
            });

            if (list.length > 0) {
                this.push({"Name": key, "Value": list});
            }
        }, refinementList);

        if (refinementList.length > 0) {
            return {"NameValueList": refinementList};
        }
    }

    return null;
}

function getQueryParam(queryParams, name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(queryParams);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Merge the chosen aspects with the aspects returned from the search. This way, we show the
 * refinements chosen by the user as checked after the search.
 * @param chosenAspects
 * @param newAspects aspects returned from the search.
 * @returns the merged aspects
 */
function mergeChosenAspects (chosenAspects, newAspects) {
    var newAspectsMap = {};
    if (newAspects) {
        if (newAspects instanceof Array) {
            angular.forEach(newAspects, function (aspect) {
                if (!chosenAspects[aspect.Name]) {
                    chosenAspects[aspect.Name] = {value : {}};
                }

                if (aspect.ValueCount instanceof Array) {
                    newAspectsMap[aspect.Name] = aspect.ValueCount;
                }
                else {
                    // Change the single element to a list
                    newAspects[newAspects.indexOf(aspect)] = {"Name": aspect.Name, "DisplayName": aspect.DisplayName ,"ValueCount": [aspect.ValueCount]};
                    newAspectsMap[aspect.Name] = [aspect.ValueCount];
                }
            });
        }
        else {
            if (!chosenAspects[newAspects.Name]) {
                chosenAspects[newAspects.Name] = {value : { }};
            }

            if (newAspects.ValueCount instanceof Array) {
                newAspects = [
                    {"Name": newAspects.Name,"DisplayName": newAspects.DisplayName, "ValueCount": newAspects.ValueCount}
                ];
                newAspectsMap[newAspects[0].Name] = newAspects[0].ValueCount;
            }
            else {
                // Change the single element to a list
                newAspects = [
                    {"Name": newAspects.Name, "DisplayName": newAspects.DisplayName,"ValueCount": [newAspects.ValueCount]}
                ];
                newAspectsMap[newAspects[0].Name] = [newAspects[0].ValueCount];
            }
        }
    }

    if (chosenAspects) {
        if (!newAspects) newAspects = [];
        angular.forEach(chosenAspects, function (value, key) {
            if (!value.hasOwnProperty("excludeMerge") || value.excludeMerge==false ) {
                if (!newAspectsMap[key]) {
                    var valueCount = [];

                    angular.forEach(value.value, function (innerValue, innerKey) {
                        if (innerValue) valueCount.push({"Value": innerKey});
                    });
                    //todo: we should see if we need the displayName here
                    if (valueCount.length > 0) newAspects.push({"Name": key,"DisplayName": key , "ValueCount": valueCount});
                }
            }
        });
    }

    return newAspects;
}

function getSSPBaseUrl () {
    var referrer = document.referrer;
    var buyerURL = referrer.split( '/' );
    return buyerURL[0] + "//" + buyerURL[2] + "/Buyer/Main/";
}

function setIframeResizeUrl (realm, height, id, sce) {
    var iFrame = document.getElementById("ResizeHeightIframe");
    if (iFrame) {
        var iframeUrl = getSSPBaseUrl() + "ad/resizeIframe/ariba.catalog.searchui.SpotBuyDirectAction?realm=" + realm + "&ht=" + height + "&id=" + id;
        iFrame.src = sce.trustAsResourceUrl(iframeUrl);
    }
}

function splitArrayForGridView (array) {
    var results = [];
    // Clone the array
    var clone = array.slice(0);
    // Split the array into an array of arrays of length 2
    while (clone.length) {
        results.push(clone.splice(0, 2));
    }
    return results;
}

function initCountryMap ($rootScope, $http) {
    if ($rootScope.countryMap != null) {
        return;
    }
    $http.get('resources/country.properties').then(function (response) {
        $rootScope.countryMap = response.data;
    });
}

function nullOrEmptyString (val) {
    return val == null || val == "";
}
