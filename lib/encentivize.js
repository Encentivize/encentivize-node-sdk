﻿//*********************************************************************************************************************************************************************
//requires
//*********************************************************************************************************************************************************************

var _options=null;
var _environment =  process.env.NODE_ENV || 'development';
if (_environment=="development") {
    _baseUrl= "https://qa.encentivize.co.za/api"
}else if (_environment=="qa") {
    _baseUrl = "https://qa.encentivize.co.za/api"
}else{
    _baseUrl = "https://{programmeName}.encentivize.co.za/api"
}
//*********************************************************************************************************************************************************************
//exports
//*********************************************************************************************************************************************************************

var krc=require("kwaai-restcall");
var _restService=krc({
    headers:{"Content-Type": "application/json"},
    baseUrl:_baseUrl
});


var achievements={
    addAchievment:
        function(options,callback){
            var url="/v1/members/{memberId}/achievements";
            options.verb="post";
            options.url=url;
            options.data=options.achievement
            makeRestRequest(options,callback);
        }

    ,getAchievements:
        function(options,callback){
            function callResult(err,result){
                if (err){return callback(err)}
                var finalResult=[];
                if (result&&result.data){finalResult=result.data;}
                return callback(null,finalResult)
            }

            var url="/v1/members/{memberId}/achievements";
            if (options.query){
                if (options.achievementId){
                    url+= "?" + options.query + "&achievementid=" + options.achievementId;
                }else{
                    url+= "?" + options.query;
                }

            }else{
                if (options.achievementId){url+="?achievementid=" + options.achievementId;}
            }

            options.verb="get";
            options.url=url;
            makeRestRequest(options,callResult);
        }



}

var adhoc={
    addAdhoc:function(options,callback){
        var url="/v1/members/{memberId}/adhocpoints";
        options.verb="post";
        options.url=url;
        options.data=options.adhoc;

        makeRestRequest(options,callback);
    }
}

var members={
    getMember:function(options,callback){

        var url="/v1/members/{memberId}";
        options.verb="get";
        options.url=url;

        makeRestRequest(options,callback);
    },
    me: function () {
        var url="/v1/members/me";
        options.verb="get";
        options.url=url;
        makeRestRequest(options,callback);
    }
}

module.exports={
    achievements:achievements,
    adhoc:adhoc,
    members:members
}


function makeRestRequest(options,callback){

    if (!options.headers){options.headers={};}

    if (options.token){
        options.headers.externalauthtoken=options.token;
        options.auth={user:options.token,password:"xxxxxx"};
    }if (!options.auth && options.username && options.password){
        options.auth={user:options.username,password:options.password};
    }

    function serviceCalled(err,result,statusCode,location){
        return callback(err,result,statusCode,location);
    }

    _restService.callRestService(options,serviceCalled);
}
