// Updated 4/9/2020
// Written by Zachary Campbell
// Makes HTML calls and stores data for device information

(function(){
    hsdTechnology.factory('deviceService',['$http','$q',
        function($http,$q){
            // variable to pass a request between controllers
            var request=null;
            // variable to pass a device between controllers
            var device=null;
            // variable to hold device list to avoid calling for 1000+ devices everytime the list is needed
            var deviceList=[];
            return {
                // Set request
                setRequest:function(req){
                    request=req;
                },
                // Get request
                getRequest:function(){
                    return request;
                },
                // Set device
                setDevice:function(dev){
                    device=dev;
                },
                // Get device
                getDevice:function(){
                    return device;
                },
                // Get device list. 
                // $q used to return a promise to it can be strung with others
                getDeviceList:function(){
                    
                    return $q((resolve)=>{
                        return resolve(deviceList);
                    })
                },
                // Call to checkout a device
                checkoutDevice: function(checkoutDevice){
                    var deviceUrl=`/ws/schema/table/u_technology_devices/${checkoutDevice.device.id}?projection=*`;
                    return $http.get(deviceUrl).then(function(data){
                        if(data.status==200){
                            if(data.data.tables.u_technology_devices.ischeckedout=='false'){
                                var deviceData={
                                    'tables':{
                                        'u_technology_devices':{
                                            'ischeckedout':'true'
                                        }
                                    }
            
                                }
                                return $http.put(deviceUrl,deviceData).then(function(data){
                                    if(data.status=200){
                                        var checkoutData={
                                            'tables':{
                                                'u_technology_checkedout_device':{
                                                    "studentsdcid":`${checkoutDevice.request.studentsdcid}`,
                                                    "checkedoutbyid":`${checkoutDevice.checkedoutby.id}`,
                                                    "checkedoutdate":`${checkoutDevice.checkedoutdate}`,
                                                    "devicetagnumber":`${checkoutDevice.device.tagnumber}`
                                                }
                                            }
                                        }
                                        var checkOutUrl='/ws/schema/table/u_technology_checkedout_device';
                                        var requestUrl=`/ws/schema/table/u_technology_reserved_devices/${checkoutDevice.request.requestid}`;
                                        return $http.delete(requestUrl).then(function(data){
                                                    if(data.status==204){
                                                        return $http.post(checkOutUrl,checkoutData).then(function(data){
                                                            return data;
                                                        })
                                                    }else{
                                                        return {
                                                            status:400,
                                                            message:"Something went wrong deleting request",
                                                            data:data
                                                        }
                                                    }
                                                })
                                                
                                    }else{
                                        return {
                                            status:400,
                                            message:"Something went wrong checking out device",
                                            data:data
                                        }
                                    }
                                })
                            }else{
                                return {
                                    status:400,
                                    message:"Device already checked out",
                                    data:data
                                }
                            }
                        }else{
                            return {
                                status:404,
                                message:"Something went wrong retrieving device data",
                                data:data
                            }
                        }
                    })
                },
                // Call to checkin a device
                checkinDevice: function(checkinDevice){
                    var returnUrl=`/ws/schema/table/u_technology_returned_devices?projection=*`
                    var returnData=`{
                        "tables":{
                            "U_TECHNOLOGY_RETURNED_DEVICES":{
                                "STUDENTDCID":"${checkinDevice.device.studentsdcid}",
                                "DEVICETAGNUMBER":"${checkinDevice.device.tagnumber}",
                                "RETURNEDBYID":"${checkinDevice.checkinby.id}",
                                "RETURNEDDATE":"${checkinDevice.checkindate}",
                                "RETURNNOTES":"${checkinDevice.checkinnotes}",
                                "U_TECHNOLOGY_DEVICESID":"${checkinDevice.device.deviceid}"
                            }
                        }
                    }`
                    return $http.post(returnUrl,returnData).then(function(data){
                        if(data.status==200){
                            var checkoutUrl=`/ws/schema/table/u_technology_checkedout_device/${checkinDevice.device.checkedoutid}?projection=*`;
                            return $http.delete(checkoutUrl).then(function(data){
                                if(data.status==204){
                                    var deviceUrl=`/ws/schema/table/u_technology_devices/${checkinDevice.device.deviceid}?projection=*`;
                                    var deviceData=`{
                                        "tables":{
                                            "u_technology_devices":{
                                                "ischeckedout":"false"
                                            }
                                        }
                                    }`
                                    return $http.put(deviceUrl,deviceData).then(function(data){
                                        if(data.status==200){
                                            return data;
                                        }else{
                                            return {
                                                status:400,
                                                message:"Something went wrong while updating device record!",
                                                data:data
                                            }
                                        }
                                    })
                                }else{
                                    return {
                                        status:400,
                                        message: "Something went wrong while deleting checkout record!",
                                        data:data
                                    }
                                }
                            })
                        }else{
                            return{
                                status:400,

                            }
                        }
                    })
                },
                // Call to get all devices from server
                // Sets Device List variable
                getAllDevices: function(){
                    deviceList=[];
                    var countUrl='/ws/schema/table/u_technology_devices/count';
                    return $http.get(countUrl).then(function(data){
                        var count = data.data.count;
                        var devicesUrl='/ws/schema/table/u_technology_devices?projection=*'
                        if(count<100){
                            
                            var config = {"headers":{"Content-Type":"application/json","Accept":"application/json"}}
                            return $http.get(devicesUrl,{},config).then(function(data){
                                _.each(data.data.record,function(record){
                                    deviceList.push(new Device(record.tables.u_technology_devices));
        
                                })
                                return deviceList;
                            })
                        }else{
                            var promises=[]
                            for(var i=0;i<count/100;i++){
                                var url=devicesUrl+`&pagesize=100&page=${i+1}`
                                promises.push($http.get(url).then(function(data){
                                    _.each(data.data.record,function(record){
                                        deviceList.push(new Device(record.tables.u_technology_devices));
            
                                    })
                                }))
                            }
                            return $q.all(promises).then(function(){
                                return deviceList;
                            });
                        }
                    })
                    
                },
                // call to get students checked out devices
                getStudentCheckedoutDevices: function(){
                    var devices=[];
                    var data={};
                    var url="/ws/schema/query/org.helenaschools.hsd_technology.student.checkedoutDevices"
                    var config={
                        headers: {
                            'Content-Type':'application/json;',
                            'Accepts':'application/json'
                        }
                    }
                    return $http.post(url,JSON.stringify(data),config)
                        .then(function(data){
                            _.each(data.data.record, function(element){
                                devices.push(new CheckedOutDevice(element.tables.u_technology_checkedout_device,element.tables.u_technology_devices))
                                
                            })
                            return devices;
                        })
                },
                // call to get students returned devcies
                getStudentReturnedDevices:function(){
                    var devices=[];
                    var data={};
                    var url="/ws/schema/query/org.helenaschools.hsd_technology.student.returnedDevices";
                    var config={
                        headers:{
                            'Content-Type':'application/json',
                            'Accepts':'application/json'
                        }
                    }
                    return $http.post(url,JSON.stringify(data),config).then(function(data){
                        _.each(data.data.record,function(element){
                            devices.push(new ReturnedDevice(element.tables.u_technology_returned_devices,element.tables.u_technology_devices))
                        })
                        return devices;
                    })
                },
                // call to create a single device
                createDevice:function(newDevice){
                    var url="/ws/schema/table/u_technology_devices?projection=*";
                    var data={
                        "tables":{
                            "u_technology_devices":{
                                "devicetype":newDevice.devicetype,
                                "serialnumber":newDevice.serialnumber,
                                "tagnumber":newDevice.tagnumber,
                                "school_number":newDevice.schoolid,
                                "isactive":"true",
                                "ischeckedout":"false"
                            }
                        }
                    }
                    return $http.post(url,data).then(function(data){
                        return data;
                    })
                },
                // call to mass import devices
                /* 
                    TODO: Create threading; currently will start to run out of resources around 1500 devices. This should hold up to all but the most extreme of entries
                    TODO: Return error messaging of some sort to let user know they may have to import a second time if the full list isn't imported. 

                */
                massImport:function(deviceArray){
                        var promises=[]
                        var results=[]
                        for(var i=0;i<deviceArray.length;i++){
                            promises.push(
                                this.createDevice(deviceArray[i]).then(function(data){
                                results.push({
                                    status:data.status,
                                    data:data
                                })
                            }))
                        }
                    return $q.all(promises).then(function(){
                        return results;
                    })
                }
            }
        }
    ])

    var Device = function(data){
        this.devicetype=data.devicetype;
        this.tagnumber=data.tagnumber;
        this.serialnumber=data.serialnumber;
        this.id=data.id;
        this.schoolid=data.school_number;
        this.ischeckedout=data.ischeckedout;
        this.isactive=data.isactive
    }

    var ReturnedDevice= function(returned, device){
        this.returnedby=returned.returnedby;
        this.tagnumber=returned.devicetagnumber;
        this.returneddate=returned.returneddate;
        this.serialnumber=device.serialnumber;
        this.devicetype=device.devicetype;
        this.returnnotes=returned.returnnotes;
    }

    var CheckedOutDevice= function(checkedOut, device){
        this.checkedoutid=checkedOut.checkoutid;
        this.checkedoutby=checkedOut.checkedoutby;
        this.tagnumber=checkedOut.devicetagnumber;
        this.checkedoutdate=checkedOut.checkedoutdate;
        this.deviceid=device.deviceid;
        this.serialnumber=device.serialnumber;
        this.devicetype=device.devicetype;
        this.studentsdcid=checkedOut.studentsdcid;
        
    }
    
})()