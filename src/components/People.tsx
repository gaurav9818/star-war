import React from 'react';
import Noresults from './Noresults';
const People = (props:any)=> {
  const getImageUrl = (url:string)=>{
    let ar = url.split('people/');
    let url2 = `https://starwars-visualguide.com/assets/img/characters/${ar[1].replace('/','.jpg')}`;
    return url2;
  }
  return (
    <div className="Peoples" role="list">
        {
          props.peoples && (props.peoples).map((people:any,index:number) => {
           return (<div className="card" key={index} role="listitem">
             <img src={getImageUrl(people.url)} loading="lazy" alt={people.name}/>
             <h3>{people.name}</h3>
             </div>)
          })
       }
       {
         props.peoples && !props.peoples.length && <Noresults />
       }

    </div>
  )
}
export default People;
