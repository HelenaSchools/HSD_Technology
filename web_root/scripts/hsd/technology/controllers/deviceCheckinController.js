// Updated 4/9/2020
// Written by Zachary Campbell
// Provides functionality for checking in a single device into PowerSchool to allow for tracking of checked out devices

(function(){
    hsdTechnology.controller('deviceCheckinController',['$scope','contactService','deviceService',
        function($scope,contactService,deviceService){
            $scope.$watch(
                function(){
                    return deviceService.getDevice();
                },
                function(){
                    var device = deviceService.getDevice();
                    // check for a device to checkin
                    if(device!=null){
                        $scope.checkinOptions=[];
                        $scope.checkinOptions.push({
                                id:$scope.studentid,
                                name:'Student'
                
                        })

                        // load contacts
                        contactService.getContacts(device.studentsdcid).then(function(data){
                            _.each(data,function(contact){
                                $scope.checkinOptions.push(contact);
                            })
                        })
                    
                        var today = new Date(Date.now());
                        
                        // Set data binding 
                        $scope.device={
                            checkinby:null,
                            checkindate:`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
                            device:device,
                            checkinnotes:"",
                            
                            isvalid:false,
                            validate: function(){
                                var valid=true;
                                if(this.checkinby==null  
                                )
                                    valid=false
                                this.isvalid=valid;
            
                            },
                            checkin: function(){
                                deviceService.checkinDevice(this).then(function(data){
                                    psDialogClose();
                                });
                            }
                        }
                    }
                }
            )
        }
    ])
})()