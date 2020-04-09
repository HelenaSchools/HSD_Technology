// Updated 4/9/2020
// Written by Zachary Campbell
// Makes HTML calls and stores data for request information

(function(){
    hsdTechnology.factory('requestService',['$http',
        function($http){
            return {
                // Call to get student requests
                getStudentRequests: function(){
                    var devices=[];
                    var data={};
                    var url="/ws/schema/query/org.helenaschools.hsd_technology.student.requestedDevices"
                    var config={
                        headers: {
                            'Content-Type':'application/json;',
                            'Accepts':'application/json'
                        }
                    }
                    return $http.post(url,JSON.stringify(data),config)
                        .then(function(data){
                            _.each(data.data.record, function(element){
                                devices.push(new RequestedDevice(element.tables.u_technology_reserved_devices,element.tables.person))
                                
                            })
                            return devices;
                        })
                },
                // Call to delete a request
                deleteRequest:function(request){
                    var url=`/ws/schema/table/u_technology_reserved_devices/${request.requestid}?projection=*`
                    return $http.delete(url).then(function(data){
                        return data;
                    })
                },
                // Call to request a device
                requestDevice: function(request){
                    var data={
                          "tables":{
                            "U_TECHNOLOGY_RESERVED_DEVICES":{
                          	
                          "STUDENTSDCID":`${request.studentsdcid}`,
                          "devicetype":`${request.devicetype}`,
                          "reservedbyid":`${request.requestby.id}`,
                          "reserveddate":`${request.requestdate}`
                            }
                          }
                          
                        }

                    var url="/ws/schema/table/u_technology_reserved_devices?projection=*";
                    return $http.post(url,JSON.stringify(data)).then(function(data){
                        return data;
                    })
                }
            }
        }
    ])

    // Prototype for a requested device to return
    var RequestedDevice= function(request, person){
        this.studentsdcid=request.studentsdcid;
        this.requestid=request.id;
        this.requestedby=person.lastname;
        this.requestdate=request.reserveddate;
        this.devicetype=request.devicetype;
    }
})()