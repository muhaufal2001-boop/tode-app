import react, { userState, userEffect } from "react";
import axios from "axios";

function App() {
    const [students, setStudents] = userState([]);
    const [newNIM, setNewNIM] = userState("");
    const [newName, setNewName] = userState("");
    const [eiditNIM, setEditNIM] = userState("");
    const [editName, setEditName] = userState("");
    const [editId, setEditId] = userState(null);

    useEffect(() => {

        axios.get("/students")
            .then(response => {
                setStudents(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the students!", error);
            });
    }, []);

    const addItem = () => {
        if (!newNIM || !newName) {
            alert("bath NIM and Name are required");
            return;
        }

        axios.post("/students", { nim: newNIM, name: newName })
            .then(response => {
                setStudents([...students, { id: response.data.studentId, nim: newNIM, name: newName }]);
                setNewNIM("");
                setNewName("");
            })
            .catch(error => {
                console.error("There was an error adding the student!", error);
            });
    };

    const startEdit = (student) => {
        if (!editNIM || !editName) {
            alert("bath NIM and Name are required");
            return;
        }

        axios.put(`/students/${student.id}`, { nim: editNIM, name: editName })
            .then(response => {
                const updatedStudents = students.map(s => s.id === student.id ? response.data : s);
                setStudents(updatedStudents);
                setEditId(null);
                setEditNIM("");
                setEditName("");
            })
            .catch(error => {
                console.error("error updating the student!", error);
            });
    };

    const deleteItem = (id) => {
        axios.delete(`/students/${id}`)
            .then(response => {
                setStudents(students.filter(s => s.id !== id));
            })
            .catch(error => {
                console.error("There was an error deleting the student!", error);
            });
    };

    function startEdit(id, nim, name) {
        setEditId(id);
        setEditNIM(nim);
        setEditName(name);
    }

    return (
        <div>
            <h1>Student List</h1>
            {!editId && (
            <div>
                <h2>Add New Student</h2>
                <label>NIM</label>
                <input
                    type="text"
                    value={newNIM}
                    onChange={(e) => setNewNIM(e.target.value)}
                    placeholder="Enter Name"
                />
                <br />
                <button onClick={addItem}>Add Student</button>
            </div>
            )}
        </div>
    );
}

export default App;