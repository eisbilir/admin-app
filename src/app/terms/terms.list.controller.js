'use strict';

var module = angular.module('supportAdminApp');

module.controller('terms.TermsListController', ['$scope', '$rootScope', '$log',
  'TermsService', 'Alert', '$timeout', '$uibModal','AGREE_ELECTRONICALLY', 
  'AGREE_FOR_DOCUSIGN_TEMPLATE',
    function ($scope, $rootScope, $log, TermsService, $alert, $timeout, $modal, 
      electronicallyAgreeableId, agreeForDocuSignTemplateId) {

      $scope.electronicallyAgreeableId = electronicallyAgreeableId;
      $scope.agreeForDocuSignTemplateId = agreeForDocuSignTemplateId;
      // search
      $scope.formSearch = {
        isLoading: false,
        criteria: {
          title: ""
        },
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      // the current page number
      $scope.pageNumber = 1;
      // the total terms of use count in DB
      $scope.totalTerms = 0;
      
      // clear the alert
      $alert.clear();

      /**
       * Search terms of use
       */
      $scope.search = function (pageReset) {
        $alert.clear();
        var title = $scope.formSearch.criteria.title;

        if(pageReset == true){
          $scope.pageNumber = 1;
        }
        var filter = '';
        filter += "page="+$scope.pageNumber;
        filter += "&perPage="+25;
        if(title) {
          filter += "&title="+title;
        }

        $scope.formSearch.setLoading(true);
        TermsService.search(
          {filter: filter}
        ).then(function (response) {
          $scope.termsList = response.result;
          $scope.totalTerms = response.totalCount;
          $scope.formSearch.setLoading(false);
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.formSearch.setLoading(false);
        });
      };

      // change to a specific page
      $scope.changePage = function (pageNumber) {
        if (pageNumber === 0 || pageNumber > $scope.getLastPage() || $scope.pageNumber === pageNumber) {
          return false;
        }
        $scope.pageNumber = pageNumber;
        $scope.search();
      };

      // get the number array that shows the pagination bar
      $scope.getPageArray = function() {
        var res = [];
        for (var i = $scope.pageNumber - 5; i <= $scope.pageNumber; i++) {
          if (i > 0) {
            res.push(i);
          }
        }
        for (var i = $scope.pageNumber + 1; i <= $scope.getLastPage() && i <= $scope.pageNumber + 5; i++) {
          res.push(i);
        }
        return res;
      };

      // move to the last page
      $scope.getLastPage = function () {
        return parseInt($scope.totalTerms / 25) + 1;
      };

       /**
       * Delete the terms of use by id
       */
      $scope.deleteTerms = function (termsId) {
        if (!confirm('Are you sure want to delete this terms of use?')) {
          return;
        }
        TermsService.deleteTerms(termsId).then(function () {
          $scope.search(true);
        })
        .catch(function (error) {
            $alert.error(error.error, $rootScope);
            $scope.formSearch.setLoading(false);
        });
      };

      /**
       * handles add user click.
       * @param {Object} term the selected term.
       */
      $scope.openAddUserDialog = function (term) {
        var modalInstance = $modal.open({
          size: 'sm',
          templateUrl: 'app/terms/sign-terms-dialog.html',
          controller: 'terms.SignTermsController',
          resolve: {
            parentScope: function() {
              return $scope;
            },
            term:function () {
              return term
            }
          }
        });
      };


      // load the terms list on controller init
      $scope.search();
    }
]);