//*********************************************************************************************************************************************************************
//requires
//*********************************************************************************************************************************************************************
var restClient = require('node-rest-client').Client;

var _options=null;
var _environment =  process.env.NODE_ENV || 'development';
if (_environment=="development") {
    _options = {baseUrl: "https://qa.encentivize.co.za/api"}
}else if (_environment=="qa") {
    _options = {baseUrl: "https://qa.encentivize.co.za/api"}
}else{
    _options ={baseUrl: "https://{programmeName}.encentivize.co.za/api"}
}
//*********************************************************************************************************************************************************************
//exports
//*********************************************************************************************************************************************************************


var achievements={
    addAchievment:
        function(options,callback){
            var url="/{version}/members/{memberId}/achievements";
            options.verb="post";
            options.url=url;
            options.data=options.achievement
            makeRestRequest(options,callback);
        }

    ,getAchievements:
        function(options,callback){
            function callResult(err,result){
                if (err){return callack(err)}

                var finalResult=[];

                if (result&&result.data){finalResult=result.data;}

                return callback(null,finalResult)

            }

            var url="/{version}/members/{memberId}/achievements";
            options.verb="get";
            options.url=url;
            makeRestRequest(options,callResult);
        }

}

var adhoc={
    addAdhoc:function(options,callback){
        var url="/{version}/members/{memberId}/adhocpoints";
        options.verb="post";
        options.url=url;
        options.data=options.adhoc
        makeRestRequest(options,callback);
    }
}

module.exports={
    achievements:achievements,
    adhoc:adhoc

}


function parseUrl(url,options){
    var baseUrl=_options.baseUrl;
    if (options.baseUrl){baseUrl=options.baseUrl}
    if (!options.version){options.version="v1"}
    url = baseUrl+url;

    for (var k in options){
        url=url.replace("{" + k + "}",options[k])
    }
    return url;
}


function makeRestRequest(options,callback){
    var client=null;
    var args={
        headers:{
            "Content-Type": "application/json"
        }
    }

    var options_auth={};
    if (!options.token){
        options_auth={user:options.username,password:options.password};
    }else{
        args.headers.externalauthtoken=options.token;
        options_auth={user:options.token,password:"xxxxxx"};
    }
    client=new restClient(options_auth);

    if (options.data){args.data=options.data;}


    function apiCalled(result,response){
        return parseResult(response.statusCode,result,callback);
    }

    var url=parseUrl(options.url,options);

    var retryCnt=5;
    function tryClient(){
        function errorRetry(err){
            console.log("retrying encentivize sdk " + options.verb + ":" + retryCnt);
            if (retryCnt>0){
                retryCnt--;
                setTimeout(tryClient,5000);

            }
            else{
                return callback('Error connecting to encentivize api', err.message);
            }
        }

        try{
            client[options.verb](url, args, apiCalled).on('error',function(err){
                errorRetry(err);
            })
        }
        catch(exp){
            errorRetry(exp);
        }
    }

    tryClient();
}



function parseResult(statusCode,result,callback){
    if (statusCode>=500){
        return callback(result);
    }
    else if (statusCode==204){
        return callback(null,null);
    }
    else if (statusCode>=200&&statusCode<300){
        if (result==""){return callback(null,null)}
        return callback(null,JSON.parse(result));
    }
    else if (statusCode==404){
        return callback(null,null);
    }
    else if (statusCode==401){
        return callback("Not Authorised",null);
    }
    else if (statusCode==400){
        var resError = "";
        if (result){
            var resError =JSON.stringify(result);
        }
        return callback("Bad Request" + resError,null);
    }
    else{
        return callback(null,null);
    }

}
