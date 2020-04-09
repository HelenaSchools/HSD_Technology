// Updated 4/9/2020
// Written by Zachary Campbell
// Pulls data for display on the district technology page

(function(){
    hsdTechnology.controller('technologySetupController',['$scope','deviceService','settingsService',
        function($scope, deviceService,settingsService){
            $scope.technologyData={};
            $scope.technologyData.errorMessage=""
            $scope.technologyData.successMessage=""

            // data binded variable to hold settings
            $scope.settings={
                get: function(){
                    settingsService.getAllSettings().then(function(data){
                        $scope.settings.data=data;
                    })
                },
                data:{},
                set: function(){
                    settingsService.setSettings($scope.settings.data).then(function(data){
                        if(data.status==200){
                            $scope.technologyData.successMessage="Settings successfully updated!"
                            ResetMessages()
                        }else{
                            $scope.technologyData.errorMessage="Settings not updated! See console."
                            console.log(data)
                            ResetMessages()
                        }
                    })
                }
            };

            $scope.settings.get();
            
            
            // function to refresh all devices
            var refreshDevices=function(){
                deviceService.getAllDevices().then(function(data){
                    $scope.devices={
                        devices:[],
                        deviceTypes:[]
                    }
                    $scope.panel={
                        template: '',
                        isOpen: null,
                        record: null,
                        currentIndex: null
                    }
                    var deviceTypes=[]
                    // Iterates through all returned devices
                    _.each(data,function(record){
                        // adds new device type to array
                        if(!deviceTypes.includes(record.devicetype)){
                            deviceTypes.push(record.devicetype)  
                            $scope.devices.deviceTypes.push({
                                name:record.devicetype,
                                count:0,
                                checkedout:0
                                
                            })
                        }
                        
                        // insures the device is active and adds to the array if true
                        if(record.isactive=="true"){
                            var i=0
                            // Adds checkedout status to the appropriate device type object
                            for(i=0;i<$scope.devices.deviceTypes.length;i++){
                                if($scope.devices.deviceTypes[i].name==record.devicetype){
                                    
                                    if(record.ischeckedout=="true"){
                                        $scope.devices.deviceTypes[i].checkedout++
                                    }
                                    $scope.devices.deviceTypes[i].count++
                                }
                            }
                        }
                    })
                })
            }

            refreshDevices()

            // Sends a call to open the add device dialog modal
            $scope.openAddDeviceDialog=function(){
                var titleText="Add Device";
                var dialogHolder=$j('#addDeviceDialog');
                var submitButton=$j('#submitNewDeviceButton');
                createPsDialog(titleText,dialogHolder,submitButton)
            }

            // Sends a call to open the import devices dialog modal
            $scope.openImportDevicesDialog=function(){
                var titleText="Import Devices";
                var dialogHolder=$j('#importDevicesDialog');
                var submitButton=$j('#importCsvButton');
                createPsDialog(titleText,dialogHolder,submitButton)
            }

            // Resets success and error messages after 10 seconds
            var ResetMessages = function(){
                setTimeout(function(){
                    $scope.technologyData.successMessage="";
                    $scope.technologyData.errorMessage="";
                },10000)
            }
            
            // uses PowerSchool built in ability to make modals via psDialog see page at https://ps.helenaschools.org/admin/ui_examples/angularjs/psDialog.html for more info.
            var createPsDialog=function(titleText,element,buttonElement){
                var psDialogHolder=element.detach();
                _.defer(function(){
                    psDialog({
                        docked: 'east',
                        type: 'dialogM',
                        resizable: 'false',
                        title: titleText,
                        content: psDialogHolder,
                        width: '20%',
                        initBehaviors: true,
                        close: function() {
                            closeLoading();
                            $j('#dialogHolder').append(psDialogHolder);
                            $scope.$apply(function(){
                                $scope.panel.template='';
                                $scope.checkoutRequest=false;
                                refreshDevices();
                            })
                        },
                        buttons: [
                            {
                                id: 'cancelButton',
                                text:'Cancel',
                                click: function(){
                                    psDialogClose();
                                },
                                
                            }
                        ]
                    })
                    _.defer(function(){
                        $j('#psDialogDocked').parent().css('min-width','500px');
                        $j('div.ui-dialog-buttonset').append(buttonElement);
                    })
                }) 
            }
        }
    ])
})()