var express=require('express');
var app=express();
var db=require('./model/db.js');
var formidable=require('formidable');
var objectid=require('mongodb').ObjectID;
app.set('view engine','ejs');
app.use(express.static('./public'));
//显示留言列表
app.get('/',function(req,res,next){
	db.getAllCount('liuyanben',function(count){
		res.render('index',{
			'pagea':Math.ceil(count/4)
		});
	});
})
//读取所有留言
app.get('/du',function(req,res){
	var page=parseInt(req.query.page);
	var a=[];
	db.find('liuyanben',{},{'sort':{'shijian':-1},'pageamount':4,'page':page},function(err,result){
		if(err){
			console.log(err);
		}
		res.send(result);	
	})
})
//删除留言
app.get('/a',function(req,res){

	db.getAllCount('liuyanben',function(count){
		res.send(count.toString());
	});
})
//提交留言
app.post('/tijiao',function(req,res,next){

	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		//判断是否重复用户名
		db.find('liuyanben',{'xingming':fields.xingming},function(err,result){
			if(result.length!=0){
				res.json('0');
				return;
			}
			//写入数据库
			db.insertOne('liuyanben',{
				'xingming':fields.xingming,
				'liuyan':fields.liuyan,
				'shijian':new Date()
			},function(err){
				if(err){
					res.json('-1');

					return;
				}
				res.json('1');
			})

		})
		
		
	})
})
//删除
app.get('/shanchu',function(req,res,next){
	var id=req.query.id;
	var name=req.query.name;
	console.log(id);
	db.deleteMany('liuyanben',{'_id':objectid(id)},function(err,result){
		console.log(err);
		
	})
	db.deleteMany('gentie',{'hui':name},function(err,result){
		console.log(err);
		res.redirect('/');
	})
})
//修改
app.get('/xiugai',function(req,res,next){
	var xingming=req.query.id;

	res.render('xiugai',{
		'xingming':xingming
	});
})
//修改保存
app.post('/xiubc',function(req,res,next){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		console.log(fields);
		db.updateMany('liuyanben',{'xingming':fields.xingming},{
		$set:{'liuyan':fields.liuyan}
		},function(err,result){
			if(err){
			res.json('-1');
			return;
			}
			res.json('1');
		})
	})
})
//跟帖
app.get('/gentie',function(req,res,next){
	var xingming=req.query.id;
	res.render('gentie',{
		'xingming':xingming
	});
})
app.post('/gen',function(req,res,next){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields){
		//写入数据库
		db.insertOne('gentie',{
			'xingming':fields.xingming,
			'hui':fields.hui,
			'liuyan':fields.liuyan,
			'shijian':new Date()
		},function(err){
			if(err){
				res.json('-1');

				return;
			}
			res.json('1');
		})
	})

})
//读跟帖
app.get('/dugentie',function(req,res){
	db.find('gentie',{},{'sort':{'shijian':-1}},function(err,result){
		if(err){
			console.log(err);
		}
		res.send(result);	
	})
})
//删除跟帖
app.get('/shangentie',function(req,res,next){
	var id=req.query.id;
	console.log(id);
	db.deleteMany('gentie',{'_id':objectid(id)},function(err,result){
		console.log(err);
		res.redirect('/');
	})
})

app.listen(3000);
