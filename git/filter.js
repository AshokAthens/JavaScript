'use strict';

var spotbuyFilters = angular.module('spotbuyFilters', []);

spotbuyFilters.filter("splitArray", function(){
    return function(input, test){
        var newArray = [];
        for(var x = 0; x < input.length; x+=2){
            newArray.push(input[x]);
        }
        return newArray;
    }
});

spotbuyFilters.filter("checkmark", function(){
    return function(input) {
        return input=="true" ? '\u2713' : '\u2718';
    };
});

spotbuyFilters.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);