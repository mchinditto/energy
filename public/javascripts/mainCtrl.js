var app = angular.module('energyApp', []);

app.config(function($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      'request': function(config) {
         document.body.style.cursor = "progress";
         return config;
      },
      'response': function(response) {
        setTimeout(function(){document.body.style.cursor = 'default';},1000);
        return response;
      }
    };
  });
});

app.service('dataService', function($http) {
  this.google_api_key = 'AIzaSyB1rXlPri1LEFcjbySjyo3_q1Z8RuUPWpU',
  this.nrel_api_key = '6cdltAisWpaRxkOYMHNFB5c1IGWPc5NFUPXfX4T2',
  this.getData = function(address) {
    return $http({
      method: 'GET',
      url: 'https://maps.googleapis.com/maps/api/geocode/json?',
      params: {
        sensor: true,
        key: this.google_api_key,
        address: address
      }
    }).error(function(data, status, headers, config) {
      console.log(data);
      alert(data);
    });
  },
  this.getUtil = function(lat, lon) {
    return $http({
      method: 'GET',
      url: 'http://developer.nrel.gov/api/utility_rates/v3.json?',
      params : {
        api_key : this.nrel_api_key,
        lat : lat,
        lon : lon
      }
    });
  },
  this.getPV = function(lat, lon) {
    return $http({
      method: 'GET',
      url: 'http://developer.nrel.gov/api/pvwatts/v4.json?',
      params : {
        api_key : this.nrel_api_key,
        system_size : 4,
        derate: 0.77,
        lat : lat,
        lon : lon
      }
    });
  },
  this.getTarriffs = function(utilName) {
    return $http({
      method: 'GET',
      url: 'ladwp.json',
    });
  }
});

app.controller('mainCtrl', function($scope, $rootScope, dataService) {
    $scope.data = null;
    $scope.utilName;
    $scope.showGraphs = false;
    $scope.enterAdd = false;
    $scope.enterAdd = function() {
      $scope.enterAdd = true;
    }
    $scope.geo = function() {
      $scope.enterAdd = false;
      navigator.geolocation.getCurrentPosition(function(data) {
        var lat = data.coords.latitude;
        var lon = data.coords.longitude;

        dataService.getUtil(lat, lon).then(function(res) {
            $scope.showGraphs = true;
            $scope.utilName = res.data.outputs.utility_name;
            loadUtilHC(res.data);
          });
        dataService.getPV(lat, lon).then(function(res) {
          loadSolarHC(res.data);
          solarData = res.data;
        });
      });
    }
    $scope.submit = function(energy) {
      $scope.enterAdd = false;
      var address = energy.addr1+" "+energy.city+","+energy.state+ " " + energy.zip;
      dataService.getData(address).then(
        function(res) {
          lat = res.data.results[0].geometry.location.lat;
          lon = res.data.results[0].geometry.location.lng;
          dataService.getUtil(lat, lon).then(function(res) {
            $scope.showGraphs = true;
            $scope.utilName = res.data.outputs.utility_name;
            loadUtilHC(res.data);
          });
          dataService.getPV(lat, lon).then(function(res) {
            loadSolarHC(res.data);
            solarData = res.data;
          });
          /*dataService.getTarriffs("LADWP").then(function(res) {
            console.log(res);
          });*/
      });
    };
});