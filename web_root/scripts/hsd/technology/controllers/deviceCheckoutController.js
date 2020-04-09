// Updated 4/9/2020
// Written by Zachary Campbell
// Provides functionality for checking out a single device into PowerSchool to allow for tracking of checked out devices

(function(){
    hsdTechnology.controller('deviceCheckoutController',['$scope','deviceService','contactService',
        function($scope,deviceService,contactService){
            $scope.$watch(
                function(){
                    return deviceService.getRequest();
                },
                function(){
                    var request = deviceService.getRequest()
                    if(request!=null){
                        $scope.availableDevices=[];
                        $scope.filteredDevices=[];
                        $scope.deviceOptions=[
                            "Chromebook",
                            "Hotspot"
                            ]
                        
                        $scope.pickupOptions=[];
                        
                        // Load contacts
                        contactService.getContacts(request.studentsdcid).then(function(data){
                            $scope.pickupOptions.push({
                                id:$scope.studentid,
                                name:'Student'
                        })
                            _.each(data,function(contact){
                                $scope.pickupOptions.push(contact);
                            })
                        })

                        // Load devices
                        deviceService.getDeviceList().then(function(data){
                            $scope.availableDevices=data;
                        });
                            
                        // Filter to only devices that are available for checkout
                        // TODO: ensure global checkout setting is accounted for
                        $scope.filterDevices=function(input){
                            $scope.filteredDevices=[];
                            
                            angular.forEach($scope.availableDevices,function(device){
                                if(device.devicetype==input && device.ischeckedout=="false"){
                                    $scope.filteredDevices.push(device)
                                }
                            })
                        }
                        
                        var today = new Date(Date.now());

                        $scope.checkoutDevice={
                            request:request,
                            checkedoutby:null,
                            checkedoutdate:`${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`,
                            device:null,
                            isvalid:false,
                            validate: function(){
                                var valid=true;
                                if(this.request==null || 
                                    this.checkedoutby==null || 
                                    this.device==null 
                                )
                                    valid=false
                                this.isvalid=valid;

                            },
                            checkout: function(){
                                deviceService.checkoutDevice(this).then(function(data){
                                    if(data.status==200){
                                        psDialogClose();
                                        deviceService.checkoutStatus=data;
                                    }else{
                                        deviceService.checkoutStatus=data;
                                        checkoutData.errorMessage="There was an error";
                                        this.device=null;
                                        this.isvalid=false;

                                    }
                                    
                                });
                            }
                        }
                        $scope.checkoutDevice.validate();
                        $scope.filterDevices($scope.checkoutDevice.request.devicetype);
                    }
                }
            )
        }
    ])
})()