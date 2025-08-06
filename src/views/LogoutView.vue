<template>
  <h1>Logout</h1>
  <div v-if="user">
    <p>Email: {{ user.email }}</p>
    <p>UID: {{ user.uid }}</p>
    <p v-if="role === 'admin'" style="color: red;">role：admin</p>
    <p v-else-if="role" style="color: green;">role：user</p>
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <p>None</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();
const user = ref(null);
const role = ref("");

onMounted(() => {
  onAuthStateChanged(auth, async (u) => {
    user.value = u;
    if (u) {
      const userDoc = await getDoc(doc(db, "users", u.uid));
      if (userDoc.exists()) {
        role.value = userDoc.data().role;
        console.log("currentrole:", role.value);
      } else {
        role.value = "";
      }
    } else {
      role.value = "";
    }
  });
});

const logout = () => {
  signOut(auth).then(() => {
    user.value = null;
    role.value = "";
    console.log("account logged out successfully");
  });
};
</script>
