angular.module('legendarySearch.main', [
	'ngStorage',
	'ui.bootstrap',
	'legendarySearch',
	'redglow.gw2api',
	'legendarySearch.bank',
	'legendarySearch.wallet',
	'legendarySearch.recipeCompanion',
	'legendarySearch.recursiveRecipeComputer',
	'supplyCrateApp.price',
	'legendarySearch.itemTable',
	'legendarySearch.convertToBoolean',
	'legendarySearch.disciplinesTable'
])

.controller('Main', [
	        "$scope", "$q", "$localStorage", "$modal", "GW2API", "Bank", "Wallet", "RecursiveRecipeComputer", "RecipeCompanion",
	function($scope,   $q,   $localStorage,   $modal,   GW2API,   Bank,   Wallet,   RecursiveRecipeComputer,   RecipeCompanion) {
		// error function
		function errorFunction(error) {
			return $modal.open({
				templateUrl: 'program/main_error_dialog.html',
				controller: 'ErrorDialogController',
				resolve: {
					error: function() { return error; }
				}
			}).result.then(function() {
				return $q.reject(error);
			}, function() {
				return $q.reject(error);
			});
		}
		
		// initialize legendary list
		function mapItemIdsToItems(itemIds) {
			return $q.all(jQuery.map(itemIds, function(itemId) {
				return GW2API.getItem(itemId).then(function(item) {
					return {name: item.name, id: item.id};
				});
			})).then(function(items) {
				items.sort(function(l1, l2) {
					return l1.name.localeCompare(l2.name);
				});
				return items;
			}, errorFunction);
		}
		var availableLegendariesIds = RecipeCompanion.getLegendaryIds();
		mapItemIdsToItems(availableLegendariesIds).then(function(availableLegendaries) {
			$scope.availableLegendaries = availableLegendaries;
		});
		var namedExoticsIds = RecipeCompanion.getNamedExoticsIds();
		mapItemIdsToItems(namedExoticsIds).then(function(namedExotics) {
			$scope.namedExotics = namedExotics;
		});
		var othersIds = RecipeCompanion.getOthersIds();
		mapItemIdsToItems(othersIds).then(function(others) {
			$scope.others = others;
		});
		$scope.$watch('currentFamily', function(newValue, oldValue) {
			if(oldValue != newValue && !!newValue) {
				$scope.selectedItemId = null;
			}
		});
		
		// initialize TP management
		$scope.buyImmediately = true;
		
		// bank management
		$scope.bankContent = {};
		$scope.hasBankContents = false;
		$scope.$watch('apiKey', function() {
			$scope.bankContentErrors = null;
			if(!$scope.apiKey) {
				$scope.bankContent = {};
				$scope.hasBankContents = false;
				return;
			}
			Bank.getFullContent($scope.apiKey).then(function(data) {
				$scope.bankContent = data.items;
				$scope.bankContentErrors = data.errors;
				console.debug("$scope.bankContent =", $scope.bankContent);
				console.debug("$scope.bankContentErrors =", $scope.bankContentErrors);
			}, function(response) {
				$scope.bankContent = {};
				$scope.bankContentErrors = {
					accessError: response.data.text
				};
			})
			.then(function() {
				$scope.hasBankContents = !!$scope.bankContent && !jQuery.isEmptyObject($scope.bankContent);
				console.debug("BC:", $scope.hasBankContents);
			});
		});
		
		// currencies management
		$scope.currenciesContent = {};
		$scope.hasCurrenciesContents = false;
		$scope.$watch('apiKey', function() {
			$scope.currenciesContentErrors = null;
			if(!$scope.apiKey) {
				$scope.currenciesContent = {};
				$scope.hasCurrenciesContents = false;
				return;
			}
			$localStorage.apiKey = $scope.apiKey;
			Wallet.getFullContent($scope.apiKey).then(function(data) {
				$scope.currenciesContent = data;
				console.debug("$scope.currenciesContent =", $scope.currenciesContent);
			}, function(response) {
				$scope.currenciesContent = {};
				$scope.currenciesContentErrors = {
					accessError: response.data.text
				};
			})
			.then(function() {
				$scope.hasCurrenciesContents = !!$scope.currenciesContent && !jQuery.isEmptyObject($scope.currenciesContent);
				console.debug("CC:", $scope.hasCurrenciesContents);
			});
		});
		
		// load cost tree
		var loadingTree = false,
			reloadTreeAtReturn = false;
		function reloadTree() {
			if(!$scope.selectedItemId) {
				$scope.costTree = null;
				return;
			}
			if($scope.buyImmediately === null) {
				return;
			}
			if(loadingTree) {
				reloadTreeAtReturn = true;
				return;
			}
			loadingTree = true;
			RecursiveRecipeComputer
				.getRecipeTree($scope.selectedItemId,
					$scope.showOnlyRemainingCosts ? ($scope.bankContent || {}) : {},
					$scope.showOnlyRemainingCosts ? ($scope.currenciesContent || {}) : {},
					$scope.buyImmediately)
				.then(function(data) {
					loadingTree = false;
					if(reloadTreeAtReturn) {
						console.debug("Reload tree.");
						reloadTreeAtReturn = false;
						reloadTree();
					}
					console.debug(data);
					$scope.costTree = data;
				}, errorFunction);
		}
		$scope.$watch('bankContent', reloadTree);
		$scope.$watch('showOnlyRemainingCosts', reloadTree);
		$scope.$watch('selectedItemId', function() {
			reloadTree();
		});
		$scope.$watch('buyImmediately', reloadTree);
		$scope.$watch('showPercentage', reloadTree);
		
		// num running requests
		$scope.runningRequests = GW2API.getNumRunningRequests;
		
		// show percentage
		function computeShowPercentage() {
			$scope.showPercentage = $scope.showOnlyRemainingCosts &&
				!!$scope.bankContent &&
				!jQuery.isEmptyObject($scope.bankContent);
		}
		$scope.$watch('bankContent', computeShowPercentage);
		$scope.$watch('showOnlyRemainingCosts', computeShowPercentage);

		// local storage management
		function bindLocalStorageUpdate(name) {
			$scope.$watch(name, function() {
				if(!!$scope[name]) {
					$localStorage[name] = $scope[name];
				}
			});			
		}
		$scope.apiKeyTemp = $scope.apiKey = $localStorage.apiKey;
		bindLocalStorageUpdate('apiKey');
		$scope.currentFamily = $localStorage.currentFamily || 'legendary';
		bindLocalStorageUpdate('currentFamily');
		$scope.selectedItemId = $localStorage.selectedItemId;
		bindLocalStorageUpdate('selectedItemId');
		$scope.buyImmediately = $localStorage.buyImmediately || false;
		bindLocalStorageUpdate('buyImmediately');
		$scope.showOnlyRemainingCosts = $localStorage.showOnlyRemainingCosts === undefined ? true : $localStorage.showOnlyRemainingCosts;
		bindLocalStorageUpdate('showOnlyRemainingCosts');
	}
])

.controller('ErrorDialogController', [
	        "$scope", "error",
	function($scope,   error) {
		$scope.error = error;
		$scope.openedDetails = false;
		$scope.toggleDetails = function() {
			$scope.openedDetails = !$scope.openedDetails;
		};
	}
])

;