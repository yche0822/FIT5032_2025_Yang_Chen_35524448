<template>
  <h1>Sign in</h1>
  <p><input type="text" placeholder="Email" v-model="email"/></p>
  <p><input type="password" placeholder="Password" v-model="password" /></p>
  <p><button @click="signin">Sign in via Firebase</button></p>
  <div v-if="role">
    <h2 v-if="role === 'admin'" style="color: red;">Welcome admin！</h2>
    <h2 v-else style="color: green;">welcome user!</h2>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const email = ref("");
const password = ref("");
const router = useRouter();
const auth = getAuth();
const db = getFirestore();
const role = ref("");

const signin = async () => {
  try {
    const data = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("Firebase Login Successful!");
    const user = auth.currentUser;
    // console.log("user:", user);
    // console.log("user.uid:", user ? user.uid : "no user");
    // console.log("db:", db);
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        role.value = userDoc.data().role;
        console.log("currentuser:", role.value);
      } else {
        role.value = "";
        console.log("No user role information found");
      }
    }
  } catch (error) {
    console.log(error.code);
  }
};
</script>