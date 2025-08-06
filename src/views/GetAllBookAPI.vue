<template>
    <div v-if="apiResponse" class="api-response">
        <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiResponse = ref(null)
const loading = ref(false)
const error = ref(null)

const getAllBooksData = async () => { 
    loading.value = true
    error.value = null
    try {
        const response = await fetch('src/assets/json/authors.json')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const authorsData = await response.json()
        
        const allBooks = authorsData.flatMap(author => 
            author.famousWorks.map(book => ({
                author: author.name,
                ...book
            }))
        )

        apiResponse.value = {
            success: true,
            data: {
                totalBooks: allBooks.length,
                books: allBooks
            },
            timestamp: new Date().toISOString()
        }
    } catch (err) {
        error.value = `Error loading books data: ${err.message}`
        console.error('Error loading books data:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => { 
    getAllBooksData()
})

defineExpose({
    getAllBooksData
})
</script>