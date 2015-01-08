var request = require('request');
var Q = require("q");

var utils = require("soa-example-core-utils");

var config = require("soa-example-service-config").config();

var redisUtil = require('soa-example-redis-util');

var createProduct = function(accessToken, name, price, categoryId, description){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.productServiceIp, config.productServicePort);

	var object = {
		name: name,
		price: price,
		categoryId: categoryId,
		description: description
	};

	utils.postJsonWithAccessToken(accessToken, object, url + "/products").then(function(response){
		deferred.resolve(response);
	});

	return deferred.promise;
};

var getProductById = function(accessToken, id){
	var deferred = Q.defer();

	redisUtil.get(id).then(function(product){
		if ( product ){
			console.log("Product by ID found in Redis");
			deferred.resolve(product);
			return;
		}

		var url = utils.createBaseUrl(config.productServiceIp, config.productServicePort);
		
		utils.getWithAccessToken(accessToken, url + "/products/" + id).then(function(product){	
			redisUtil.put(id, product);
			deferred.resolve(product);
		});
	});

	return deferred.promise;
};

var getProducts = function(accessToken){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.productServiceIp, config.productServicePort);
	
	utils.getWithAccessToken(accessToken, url + "/products").then(function(products){
		deferred.resolve(products);
	});

	return deferred.promise;
};

var getProductsByCategoryId = function(accessToken, categoryId){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.productServiceIp, config.productServicePort);
	
	utils.getWithAccessToken(accessToken, url + "/products/category/" + categoryId).then(function(products){
		deferred.resolve(products);
	});

	return deferred.promise;
};

var deleteCategory = function(accessToken, id){
	var deferred = Q.defer();

	var url = utils.createBaseUrl(config.productServiceIp, config.productServicePort);

	var object = {
		id: id
	};

	utils.postJsonWithAccessToken(accessToken, object, url + "/products/delete").then(function(response){
		deferred.resolve(response);
	});

	return deferred.promise;
};

module.exports = {
	createProduct: createProduct,
	getProductById: getProductById,
	getProducts: getProducts,
	getProductsByCategoryId: getProductsByCategoryId,
	deleteCategory: deleteCategory
};