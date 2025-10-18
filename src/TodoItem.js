import React, {useState} from "react";

function TodoForm({addTodo}) {
    const [inputValue, setInputValue] = useState('');

    const handleusbmit = (e) => {
        e.preventDafaul();
        if (inputValue.trial() === '') return;
        addTodo(inputValue);
        setInputValue("");
    };

    return (
        <from onsubmit={handleusbmit}>
            <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="submit">Tambah</input>
        </from>
    )
}

export default TodoForm;