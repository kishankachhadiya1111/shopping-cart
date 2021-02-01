var Product= require('../models/product');
var mongoose=require('mongoose');
mongoose.connect('mongodb+srv://Kishan:H9ragjX8tY1Ajk9n@cluster0.milz1.mongodb.net/shopping?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:true });

var products = [
    new Product({
        imagePath: 'http://www.ikozmik.com/Content/Images/uploaded/its-free-featured.jpg',
        title: 'Gothic',
        description: 'Awesome Game!!!',
        price:10
    }),
    new Product({
        imagePath: 'http://www.ikozmik.com/Content/Images/uploaded/its-free-featured.jpg',
        title: 'Gothic',
        description: 'Awesome Game!!!',
        price:10
    }),
    new Product({
        imagePath: 'http://www.ikozmik.com/Content/Images/uploaded/its-free-featured.jpg',
        title: 'Gothic',
        description: 'Awesome Game!!!',
        price:10
    }),
    new Product({
        imagePath: 'http://www.ikozmik.com/Content/Images/uploaded/its-free-featured.jpg',
        title: 'Gothic',
        description: 'Awesome Game!!!',
        price:10
    }),
];

var done=0;
for (var i=0; i<products.length; i++){
    products[i].save(function(err,result){
        done++;
        if(done === products.length)
            exit();
    });
}
function exit(){
    mongoose.disconnect();
}