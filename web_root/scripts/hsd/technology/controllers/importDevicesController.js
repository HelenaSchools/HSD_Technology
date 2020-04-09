// Updated 4/9/2020
// Written by Zachary Campbell
// Provides functionality for requesting a single device into PowerSchool to allow for tracking of checked out devices

(function(){
    hsdTechnology.controller('importDevicesController',['$scope','deviceService',
        function($scope,deviceService){
            $scope.deviceOptions=["Chromebook","Hotspot"]
            $scope.file='';
            deviceService.getDeviceList().then(function(data){
                $scope.devices=data;
            })

            // variable to hold devices 
            $scope.importDeviceList={
                length:0,
                // holds full list of devices from file
                devices:null,
                // holds only devices that don't already exist and are valid
                validDevices:[],
                isvalid:false,
                validate:function(){
                    var valid=true;
                    if(this.length==0){
                        valid=false;
                    }else{
                        // for all devices in list
                        for(var i=0;i<this.devices.length;i++){
                            var newDevice=true;
                            // ensure tagnumber is set
                            if(this.device[i].tagnumber===undefined){
                                newDevice=false;
                            }else{
                                // then check that it isn't already in the list
                                for(var j=0;j<$scope.devices.length;j++){
                                    if($scope.devices[j].tagnumber==this.devices[i].tagnumber){
                                        newDevice=false;
                                        break;
                                    }    
                                }
                            }
                            // if passes above, add to array
                            if(newDevice)
                                this.validDevices.push(this.devices[i]);
                        }                            
                    
                        if(this.validDevices.length==0){
                            valid=false;
                        }
                    }
                    this.isvalid=valid;
                },
                import:function(){
                    deviceService.massImport(this.validDevices).then(function(){

                    });
                    psDialogClose()
                },
                setData:function(data){
                    this.length=data.length;
                    this.devices=data;
                    this.validate();
                }
            }
            
            // event handler for when file is selected
            function handleFileSelect(evt){
                var files=evt.target.files;
                var reader=new FileReader();
                reader.onload=function(){
                    var rawtext=reader.result;
                    var textArray=rawtext.split("\n")
                    
                    var devices=[]
                    for(var i=1;i<textArray.length;i++){
                        var data = textArray[i].split(',');
                        if(data[0]!="")
                            devices.push(new Device(data[0],data[1],data[2],data[3]));
                    }
                    $scope.$apply($scope.importDeviceList.setData(devices))
                    
                };
                reader.readAsText(files[0]);
            }

            

            document.getElementById('files').addEventListener('change', handleFileSelect, false);
        }
            
    ])
    // Prototype for a device
    var Device= function(data1,data2,data3,data4){
        this.serialnumber=data1;
        this.devicetype=data2;
        this.schoolid=data3;
        this.tagnumber=data4;
    }
})()