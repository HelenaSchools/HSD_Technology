// Updated 4/9/2020
// Written by Zachary Campbell
// Provides functionality for requesting a single device into PowerSchool to allow for tracking of checked out devices

(function(){
    hsdTechnology.controller('deviceRequestController',['$scope','contactService','requestService',
        function($scope,contactService,requestService){
            $scope.deviceOptions=[
                "Chromebook",
                "Hotspot"
                ]
            
            $scope.requesterOptions=[];
            
            // give the page 1 second and then load contact info
            setTimeout(function(){
                contactService.getStudentDcid($scope.studentid).then(function(data){
                    $scope.requesterOptions.push({
                        id:$scope.studentid,
                        name:'Student'
                })
                    $scope.request.studentsdcid=data;
                    contactService.getContacts(data).then(function(data){
                        _.each(data,function(contact){
                            $scope.requesterOptions.push(contact);
                        })
                    })
                })
            },1000)
            
            var today = new Date(Date.now());
            
            // hold request info
            $scope.request={
                requestby:null,
                requestdate:`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`,
                devicetype:null,
                studentsdcid:null,
                isvalid:false,
                validate: function(){
                    var valid=true;
                    if(this.requestby==null || 
                        this.devicetype==null 
                    )
                        valid=false
                    this.isvalid=valid;

                },
                request: function(){
                    requestService.requestDevice(this).then(function(data){
                        psDialogClose();
                    });
                }
            }
        }
            
    ])
})()