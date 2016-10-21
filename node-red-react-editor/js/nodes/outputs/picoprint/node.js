import React from 'react';
import composeNode from '../../../utils/composeNode';
import Textfield from '../../../components/form/Textfield';

class Node extends React.Component {

       render() {
          const {selected,values,updateNode} = this.props;
          
          const nameprops = {
              id: "name",
              value: values.name || "",
              onChange: (property, event)=>{
                  updateNode(property, event.target.value);
              },
              selected: selected,
          }
          
          return <div className="flexcolumn">
          				<div>
          					<div className="flexrow">
								<div className="title">	
									<div className="centered">name</div>
								</div>
					
								<div>
									<div className="centered">
										<Textfield {...nameprops}/>
									</div>
								</div>
							</div>
						</div>
					</div>			
          
       }
}

export default composeNode(Node, 'picoprint', 
                            {
                                category: 'outputs',    
                                color: '#d45500',
                                defaults: {             
                                    name: {value:""},   
                                },
                                inputs:1,               
                                outputs:1,             
                               
                                icon: "fa-print",    
                                unicode: '\uf02f',    
                                label: function() {     
                                    return this.name||this.topic||"picoprint";
                                },
                                
                                description: ()=>"<p> This will send some text to a pico printer </p>",
                                 
                                labelStyle: function() { 
                                    return this.name?"node_label_italic":"";
                                }
                            }
                          );