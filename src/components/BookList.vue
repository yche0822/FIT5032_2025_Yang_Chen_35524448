<template>
    <div>
        <h1>Retrieve books with ISBN > 1000, ordered by ISBN (descending), and limit to 5 results</h1>
        <ul>
            <li v-for="book in books" :key="book.id">
                {{ book.name }} - ISBN: {{ book.isbn }}
                <button @click="editBook(book)">Edit</button>
                <button @click="deleteBook(book.id)">Delete</button>
            </li>
        </ul>
        <div v-if="showEditModel" class="modal">
            <div class="modal-content">
                <h2>Edit Book</h2>
                <input v-model="editingBook.name" placeholder="Book Name" />
                <input v-model="editingBook.isbn" placeholder="ISBN" type="number"/>
                <button @click="updateBook">Save</button>
                <button @click="showEditModel = false">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import db from '../firebase/init.js';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default {
    setup() {
        const books = ref([]);
        const showEditModel = ref(false);
        const editingBook = ref({ id: '', name: '', isbn: '' });
        const fetchBooks = async () => {
            try {
                const q = query(
                    collection(db, 'books'),
                    where('isbn', '>', 1000),
                    orderBy('isbn', 'desc'),
                    limit(5)
                );
                const querySnapshot = await getDocs(q);
                const booksArray = [];
                querySnapshot.forEach((doc) => {
                    booksArray.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                books.value = booksArray;
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        const deleteBook = async (bookId) => {
            try {
                await deleteDoc(doc(db, 'books', bookId));
                alert('Book deleted successfully');
                fetchBooks();
            } catch (error) {
                console.error('Error deleting book:', error);
            }
        }

        const editBook = (book) => {
            editingBook.value = { ...book };
            showEditModel.value = true;
        };

        const updateBook = async () => {
            try {
                await updateDoc(
                    doc(db, 'books', editingBook.value.id), 
                    {
                        name: editingBook.value.name,
                        isbn: Number(editingBook.value.isbn)
                    }
                );
                alert('Book updated successfully!');
                showEditModel.value = false;
                fetchBooks();
            } catch (error) {
                console.error('Error updating book:', error);
            }
        };

        onMounted(() => {
            fetchBooks();
        });

        return {
            books,
            showEditModel,
            editingBook,
            deleteBook,
            editBook,
            updateBook
        };  
    }
};
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}
.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
}
</style>