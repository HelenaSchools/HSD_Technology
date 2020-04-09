// Updated 4/9/2020
// Written by Zachary Campbell
// Makes HTML calls and stores data for contact information

(function(){
    hsdTechnology.factory('contactService',['$http',
        function($http){
            return{
                // Call to get contacts
                getContacts: function(studentdcid){
                    var contacts=[];
                    return $http.get(`/ws/contacts/student/${studentdcid}`)
                        .then(function(data){
                            _.each(data.data, function(contact){
                                contacts.push(new Contact(contact));
                            })
                            return contacts;
                        })
                },
                // Call to return student dcid if id is all we have
                getStudentDcid:function(studentid){
                    var url="/ws/schema/query/com.pearson.core.student.student_dcid_id_map";
                    var data={
                        "students_id":[studentid]
                    }
                    return $http.post(url,data).then(function(data){
                        return data.data.record[0].dcid;
                    })
                }
            }
        }
    ])

    var Contact = function(contact){
        this.id=contact.contactId;
        this.name=`${contact.lastName}, ${contact.firstName}`;
    }
})()