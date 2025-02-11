let todo=[];

let req=prompt("Please Enter your Choice");

while(true){
    if(req=="quit"){
        console.log("Quiting app");
        break;
    }

    if(req=="list"){
        console.log("-----------")
        for(let i=0;i<todo.length;i++){
            console.log(i,todo[i]);
        }
        console.log("----------")
    }
    else if(req=="add"){
        let task = prompt("Please enter task to add");
        todo.push(task);
        console.log("Task added");
    }
    else if(req="delete"){
        let idx=prompt("Please enter the index to delete");
        todo.splice(idx,1);
        console.log("Task deleted");
    }
    else{
        console.log("Wrong request");
    }
    req=prompt("Please Enter your Choice");
}