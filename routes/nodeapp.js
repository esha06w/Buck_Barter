var express = require('express');
var mysql = require('mysql');
var app = express();
var module = require('./routes/module');
app.use('/module', module);
var http = require('http');
var dateFormat = require('dateformat');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(express.static(__dirname + '/'))
app.use(bodyParser.json());
app.use(passport.initialize());
passport.serializeUser(function(user , done){
    done(null , user.id);
})
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'buck1'
});
connection.connect(function(error){
    if(!!error){
        console.log("Error");
    }
    else{
        console.log("connection established");
    }
});
    app.post('/deleteProduct' , function(req , res){
        var cope = req.body;
        console.log(cope.UnitPrice);
        connection.query('SELECT pid from added_product where Pname = ?',[cope.Pname] , function(error, Pid_result){
            console.log(Pid_result[0].Pid);
            connection.query('DELETE FROM products where Userid = ? AND pid =? AND UnitPrice = ?',[cope.U_id , Pid_result[0].pid, cope.UnitPrice]  , function(error, result){
                if(error)
                    res.status(501).send("error in DELETE");
                else
                    res.send("1 row effected");
            });
        });
    });

    app.post('/updateProduct' , function(req , res){
        var cope = req.body;
        cope.Date_Time = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        connection.query('SELECT pid from added_product where Pname = ?',[cope.Pname] , function(error, Pid_result){
            connection.query('UPDATE products SET UnitPrice = ? , Discount= ? , Quantity= ? , Description= ?, Date_Time = ? WHERE Userid = ? AND pid = ? ',[cope.UnitPrice, cope.Discount , cope.Quantity , cope.Description , cope.Date_Time , cope.U_id  , Pid_result[0].pid] , function(err,result)
            {
                console.log(result);
                if(err)
                 res.status(500).send("error in updating");
             else
                res.status(200).send('Updated successfully');
        });
        });
    });
    app.post('/shopadd', function(req,res){
        var cope = req.body;
        console.log(cope);
        var salt = bcrypt.genSaltSync(10);
        cope.Password = bcrypt.hashSync(cope.Password , salt);
        var query = connection.query('insert into users set ?',cope, function(err, result) {
            if (err){
                console.log(err);
                res.status(500).send("error");
            }
            else  {
                console.log("done");
                res.send("registered successfully");

            }
        });
    });

    app.post('/custadd', function(req,res){
        var cope = req.body;
        console.log(cope);
        var salt = bcrypt.genSaltSync(10);
        cope.Password = bcrypt.hashSync(cope.Password , salt);
        var query = connection.query('insert into users set ?', cope, function(err, result) {
            if (err){
                console.log("Error detected");
            }
            else  {
                console.log("done");
            }
        });
    });

    app.post('/addProducts', function(req,res){
        var cope = req.body;
    cope.Date_Time = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
    var pname = cope.Pname;
    var s = req.headers.authorization.toString().split(" ");
    console.log(s[0]);
    cope.Userid = parseInt(s[0]);
    connection.query('SELECT count(*) as names from added_product where Pname = ?',[pname], function(error, result) {
        console.log(result[0].names);
        if(result[0].names == 1)
        {
            connection.query('SELECT pid from added_product where Pname = ?' , [pname] , function(error , result){
                console.log(result[0].pid);
                cope.pid = result[0].pid;
                var product =
                {
                    pid : cope.pid,
                    Userid : cope.Userid,
                    UnitPrice : cope.UnitPrice,
                    Discount : cope.Discount,
                    Quantity : cope.Quantity,
                    Description : cope.Description,
                    Date_Time : cope.Date_Time
                };
                connection.query('insert into products set ?', [product], function(err, result) {
                    if (err){
                        console.log("Error detected");
                        res.send("error");
                    }
                    else  {
                        console.log("done 1 more");
                        res.send("done");
                    }
                });
            });
        }
        else{
            var id_category = connection.query('SELECT ITCid from itemcategory where ITCname = ?',[cope.ITCname] , function(error, result){
                console.log(result[0].ITCid);
                var added =
                {
                    pid:'',
                    Pname : cope.Pname,
                    ITCid : result[0].ITCid
                }
                connection.query('insert into added_product set ?', added, function(err, result) {
                 connection.query('SELECT pid from added_product where Pname = ?' , [pname , cope.NetWeight , cope.Description] , function(error , result){
                    var product =
                    {
                        pid :result[0].pid,
                        Userid : cope.Userid,
                        UnitPrice : cope.UnitPrice,
                        Discount : cope.Discount,
                        Quantity : cope.Quantity,
                        Description: cope.Description,
                        Date_Time : cope.Date_Time
                    }
                    connection.query('insert into products set ?', product, function(err, result) {
                        if (err){
                            console.log("Error detected");
                            res.send("errrrrr");
                        }
                        else  {
                            console.log("done");
                            res.send("done 1st");
                        }
                    });
                });
             });
            });
        }
    });
});
    app.post('/StoreProd', function(req,res){
        var detailed_prod = new Array();
        //console.log(req.body.id);
        connection.query('SELECT added_product.Pname , products.Userid , products.UnitPrice ,products.Discount , products.Description FROM added_product LEFT JOIN products ON (products.Pid = added_product.Pid)' , function(error , result){
            console.log(result);
            if(error)
            {
                res.status(500).send('No Products');
            }
            else
            {
                for(var i = 0 ; i < result.length ;i++){
                    if(result[i].Userid == req.body.id){
                        result[i] =
                        {
                            Pname : result[i].Pname,
                            UnitPrice: result[i].UnitPrice,
                            Discount: result[i].Discount,
                            Description: result[i].Description
                        }
                        detailed_prod.push(result[i]);
                    }
                }
            res.send(detailed_prod);
            }
    });
    });
    app.get('/getUsers' , function(req,res){
        var All_Users = new Array();
        connection.query('SELECT Userid ,Store_Name , Latitude , Longitude FROM users where Selectid = 2' , function(error , result){
        if(error)
        {
            res.status(500).send("no Availability");
        }
        else
        {
            for(var i = 0 ; i < result.length ;i++){
                    All_Users.push(result[i]);
            }
            res.send(All_Users);
        }
    });
});
    app.get('/showProduct' , function(req,res){
    var product = new Array();
    if(!req.headers.authorization){
        return res.status(401).send({
            message:'not authentiated'
        });
    }
    var s = req.headers.authorization.toString().split(" ");
    connection.query('SELECT added_product.Pname ,products.Userid , products.UnitPrice, products.Discount , products.Quantity , products.Description FROM added_product LEFT JOIN products ON (products.Pid = added_product.Pid)' , function(error , result){
        if(error)
        {
            res.status(500).send(error);
        }
        else{
            for(var i = 0 ; i < result.length ;i++){
                if(result[i].Userid == s[0])
                    product.push(result[i]);
            }
            res.send(product);
        }
    });
});
    app.get('/showCoords' , function(req,res){
        var coords = new Array();
        connection.query('SELECT users.Latitude,users.Longitude FROM users where Selectid = 2' , function(error , result){
            if(error)
            {
                res.status(500).send(error);
            }
            else{
                console.log(result);
                for(var i = 0 ; i < result.length ;i++){
                  coords.push(result[i]);
              }
              res.send(coords);
          }
      });
    });
    function createToken(cope , res){
        var payload =  {
            sub : cope
        }
        var token = jwt.encode(payload , "hello");
        console.log('in create token');
        var query = connection.query('SELECT Userid from users where Email = ?' , [cope] , function(error , result){
            res.send({
                username: cope ,
                useridd: result[0].Userid,
                token : token
            });
        });
    }
    app.listen(8091);