// Updated 4/9/2020
// Written by Zachary Campbell
// Provides functionality for adding a single device into PowerSchool to allow for tracking of checked out devices

(function(){
    hsdTechnology.controller('addDeviceController',['$scope','deviceService',
        function($scope,deviceService){
            $scope.deviceOptions=["Chromebook","Hotspot"]
            $scope.schools=[
                {schoolid:100, name:"Project for Alternative Learning"},
                {schoolid:500, name:"Ray Bjork Learning Center"},
                {schoolid:501, name:"Access to Success"},
                {schoolid:503, name:"Summer School"},
                {schoolid:651, name:"Jefferson Elementary School"},
                {schoolid:654, name:"Central Elementary School"},
                {schoolid:655, name:"Broadwater Elementary School"},
                {schoolid:656, name:"Hawthorne Elementary School"},
                {schoolid:657, name:"Bryant Elementary School"},
                {schoolid:661, name:"Helena High School"},
                {schoolid:662, name:"Kessler Elementary School"},
                {schoolid:663, name:"Warren Elementary School"},
                {schoolid:1461, name:"Jim Darcy Elementary School"},
                {schoolid:1477, name:"Smith Elementary School"},
                {schoolid:1478, name:"Rossiter Elementary School"},
                {schoolid:1547, name:"Capital High School"},
                {schoolid:1582, name:"Four Georgians Elementary School"},
                {schoolid:1614, name:"Helena Middle School"},
                {schoolid:1615, name:"C. R. Anderson Middle School"}
            ]
            
            $scope.newDevice={
                device:new Device(null,null,null,null),
                school:null,
                isvalid:false,
                validate: function(){
                    var valid=true;
                    if(this.school){
                        this.device.schoolid=this.school.schoolid.toString()
                    }
                    if(this.device.serialnumber==null||
                        this.device.tagnumber==null||
                        this.device.devicetype==null||
                        this.device.schoolid==null)
                        valid=false
                    if(valid){
                    }
                    this.isvalid=valid;
                },
                create: function(){
                    deviceService.createDevice(this.device).then(function(data){
                        psDialogClose();
                    });
                }
            }
        }
            
    ])
    var Device= function(data1,data2,data3,data4){
        this.serialnumber=data1;
        this.devicetype=data2;
        this.schoolid=data3;
        this.tagnumber=data4;
    }
})()