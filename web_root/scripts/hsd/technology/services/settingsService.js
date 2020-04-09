// Updated 4/9/2020
// Written by Zachary Campbell
// Makes HTML calls and stores data for setting information

(function(){
    hsdTechnology.factory('settingsService',['$http',
        function($http){
            return {
                // Call to get technology settings
                getAllSettings:function(){
                    var url="/ws/schema/table/u_technology_settings?projection=*"
                    return $http.get(url).then(function(data){
                        var returnData=data.data.record[0].tables.u_technology_settings;
                        if(returnData.isglobalcheckout=="true")
                            returnData.isglobalcheckout=true
                        return returnData;
                    })
                },
                // Call to set updated settings
                setSettings:function(settings){
                    var url=`/ws/schema/table/u_technology_settings/${settings.id}?projection=*`;
                        var data={
                            "IsGlobalCheckout":settings.isglobalcheckout.value
                        }
                     return $http.put(url,JSON.stringify(data)).then(function(data){
                         return data;
                     })
                }
            }
        }
    ])
})()