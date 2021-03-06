app.controller('shopkprController',function($http,$state , authToken){
	this.tab = 1;
	var gets = this;
	gets.no_products= false;
	this.uploadme = "images/200x200.gif";
	gets.names = [] ;
	this.setTab= function(tabno){
		this.tab = tabno;
	};
	this.isSelected = function(tabno){
		return this.tab === tabno;
	};
	this.product = {};
	gets.showProducts = function(){
		$http.get("/showProduct").then(function sucessCallback(response){
			gets.names = response.data;
			if(gets.names.length == 0){
				gets.no_products = true;
			}
			else{
				gets.no_products = false;
			}
		},
		function errorCallback(response){
			alert(response.message);
		});
	}
	this.productAddfunc = function(){
		var formData = new FormData;
        for(key in this.product){
            formData.append(key , this.product[key]);
        }
        var file = $('#file')[0].files[0];
        console.log(file , "file...");
        formData.append('Image' , file);
		$http.post("/addProducts" , formData , {
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
        }).then(function sucessCallback(response) {
			alert("product added successfully");
			console.log(response.data);
			gets.showProducts();
			$state.go("shopkeeper.showProduct");
		},
		function errorCallback(response){
			console.log(response.data);
			alert("something went wrong");
		});
		this.product = {};
	}
	this.productUpdate = {
		U_id:'',
		Pname:'',
		Discount:'',
		Quantity:'',
		UnitPrice:'',
		Description:'',
		filename:'',
		Date_Time: Date.now()
	};
	this.updateValue = function(x){
		this.productUpdate.U_id = authToken.getId();
		this.productUpdate.Pname = x.Pname;
		this.productUpdate.Discount = x.Discount;
		this.productUpdate.UnitPrice = x.UnitPrice;
		this.productUpdate.Quantity = x.Quantity;
		this.productUpdate.Description = x.Description;
		this.productUpdate.filename = x.filename;
	}
	this.update = function(){
		$http.post("/updateProduct",this.productUpdate).then(function successCallback(response){
			alert("product updated successfully");
			gets.showProducts();
		},
		function errorCallback(response){
			alert("error in updating");
		});
	};
	this.productDelete = {
		Pname: '',
		Description: '',
		U_id: ''
	}
	this.deletee = function(pname , Description){
		this.productDelete.Pname= pname;
		console.log(pname);
		this.productDelete.Description = Description;
		this.productDelete.U_id= authToken.getId();
		$http.post("/deleteProduct",this.productDelete).then(function sucessCallback(response) {
			alert("product deleted successfully");
			//$state.go("home");
			gets.showProducts();
		} ,
		function errorCallback(response){
			alert("something went wrong");
		});
		this.productDelete = {};
	}
});