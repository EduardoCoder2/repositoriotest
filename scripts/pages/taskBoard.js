import { API_BASE_URL } from "../../config/apiConfig.js";
import { getFromLocalStorage } from "../utils/storage.js";

const boardsList = document.getElementById("boardsList");
const userNameSpan = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const boardTitle = document.getElementById("boardTitle");
const boardLayout = document.getElementById("board");

async function loadBoards() {
    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (!response.ok) {
            throw new Error("Erro ao carregar boards");
        }
        const boards = await response.json();
        populateBoardsDropdown(boards);
    } catch (error) {
        console.error("Erro ao carregar boards:", error);
    }
}

function populateBoardsDropdown(boards) {
    
    boards.forEach((board) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a class="dropdown-item" id="dropdown-item" value="${board.Id}">${board.Name}</a>`;
        listItem.addEventListener("click", (event) => {
            // console.log(board.Id)
            boardTitle.innerHTML = event.target.innerHTML;
            loadBoard(board.Id);
        })
        boardsList.appendChild(listItem);
    });
}

async function loadBoard(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${id}`)
        if(!response.ok) {
            throw new Error("Erro ao carregar colunas");
        }
        const columns = await response.json();
        populateColumns(columns);
    } catch (error) {
        console.error("Erro ao carregar colunas:", error);
    }
}

function populateColumns(columns) {

    boardLayout.innerHTML = ""; 

    columns.forEach((column) => {

        const columnItem = document.createElement("article");
        columnItem.className = "column-item";

        const columnHeader = document.createElement("header");
        columnHeader.className = "column-header";
        columnHeader.innerHTML = `<h5>${column.Name}</h5>`;

        const columnBody = document.createElement("div");
        columnBody.className = "column-body";
        columnBody.id = `tasks-${column.Id}`;


        columnItem.appendChild(columnHeader);
        columnItem.appendChild(columnBody);


        boardLayout.appendChild(columnItem);

        fetchTasksByColumn(column.Id).then((res)=>{
            addTasksToColumn(column.Id, res)
        });


    });
}

function fetchTasksByColumn(columnId) {
    const endpoint = `${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`
    return fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar tasks para ColumnId ${columnId}: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error(error);
            return [];
        });
}

function addTasksToColumn(columnId, tasks) {
    const columnBody = document.getElementById(`tasks-${columnId}`);

    tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <h6>${task.Title || "Sem título"}</h6>
            <p>${task.Description || "Sem descrição"}</p>
        `;
        columnBody.appendChild(taskItem);
    });
}

function loadUserName() {
    const userName = getFromLocalStorage("user");
    console.log(userName)
    if (userName.name) {
        userNameSpan.textContent = `Olá, ${userName.name.split(' ')[0]}`;
    } else {
        userNameSpan.textContent = "Usuário não identificado";
    }
}

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
});


function init() {
    loadUserName();
    loadBoards();
}



const addColumnButton = document.getElementById("addColumnButton");

addColumnButton.addEventListener("click", async () => {
    const columnName = prompt("Digite o nome da nova coluna:");
    if (!columnName) return;

    const boardId = boardTitle.getAttribute(); // Assuma que o ID do board foi salvo aqui
    try {
        const response = await fetch(`${API_BASE_URL}/Column`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Name: columnName,
                BoardId: boardId,
            }),
        });
        if (!response.ok) throw new Error("Erro ao adicionar coluna");
        alert("Coluna adicionada com sucesso!");
        loadBoard(boardId);
    } catch (error) {
        console.error("Erro ao adicionar coluna:", error);
    }
});


// const deleteButton = document.createElement("button");
// deleteButton.className = "btn btn-danger btn-sm";
// deleteButton.textContent = "Excluir";
// deleteButton.addEventListener("click", async () => {
//     const confirmDelete = confirm(`Tem certeza que deseja excluir a coluna ${column.Name}?`);
//     if (!confirmDelete) return;

//     try {
//         const response = await fetch(`${API_BASE_URL}/DeleteColumn`, {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ ColumnId: column.Id }),
//         });
//         if (!response.ok) throw new Error("Erro ao excluir coluna");
//         alert("Coluna excluída com sucesso!");
//         loadBoard(boardId); // Recarrega o board
//     } catch (error) {
//         console.error("Erro ao excluir coluna:", error);
//     }
// });
// columnHeader.appendChild(deleteButton);

const btnthema = document.getElementById("btn btn-dark");

const response = await fetch(`${API_BASE_URL}/Theme`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Is_Active: true }), // Incluindo o tema no corpo
});

const changeThemeButton = document.getElementById("changeThemeButton");

changeThemeButton.addEventListener("click", async () => {
    // Alterna entre "light" e "dark"
    const newTheme = currentTheme === "light" ? "dark" : "light";

    try {
        // Realiza a requisição GET para alterar o tema na API
        const response = await fetch(`${API_BASE_URL}/Theme`, {
            method: "GET",
        });

        if (!response.ok) throw new Error("Erro ao alterar tema");

        alert("Tema alterado com sucesso!");
    } catch (error) {
        console.error("Erro ao alterar tema:", error);
    }
});

init();
