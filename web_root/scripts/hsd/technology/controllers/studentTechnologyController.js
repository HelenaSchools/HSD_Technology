// Updated 4/9/2020
// Written by Zachary Campbell
// Pulls data for display on the students technology checkout page

(function(){
    hsdTechnology.controller('studentTechnologyController',[
        '$scope','requestService','deviceService',
            function($scope,requestService,deviceService){
                $scope.checkedout=[];
                $scope.requested=[];
                $scope.returned=[];
                $scope.panel={
                    template: '',
                    record: null,
                    currentIndex: null
                }

                // function to refresh the devices for the student. 
                var refreshDevices=function(){
                    deviceService.getStudentCheckedoutDevices().then(function(data){
                        $scope.checkedout=data;
                    });
    
                    requestService.getStudentRequests().then(function(data){
                        $scope.requested=data;
                    })

                    deviceService.getStudentReturnedDevices().then(function(data){
                        $scope.returned=data;
                    })
                    deviceService.getAllDevices();

                }

                refreshDevices();

                // Opens a dialgo to checkout a device
                $scope.checkoutDevice = function(request){
                    deviceService.setRequest(request);
                    var titleText='Check Out Device';
                    createPsDialog(titleText,$j('#checkoutDialog'),$j('#submitCheckoutButton'));

                }

                // Opens a dialog to checkin a device
                $scope.checkinDevice=function(device){
                    deviceService.setDevice(device);
                    var titleText='Check In Device';
                    createPsDialog(titleText,$j('#checkinDialog'),$j('#submitCheckinButton'));
                }
                
                // Opens dialog for a new request
                $scope.createNewRequest = function(){
                    var titleText="Create New Device Request"
                    
                    createPsDialog(titleText,$j('#requestDialog'),$j('#submitRequestButton'));
                }

                // Sends a request to delete a request and, if successful (204 status), refreshes devices
                $scope.deleteRequest=function(request){
                    deviceService.deleteRequest(request).then(function(data){
                        if(data.status==204){
                            refreshDevices();
                        }else{
                            console.log(data);
                        }

                    })
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
        ]
    )
    
    
})()