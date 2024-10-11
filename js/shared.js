const baseUrl = "https://tarmeezacademy.com/api/v1";

// Login
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", () => {
  toggleLoader(true);
  let username = document.getElementById("login-username");
  let password = document.getElementById("login-password");
  axios
    .post(`${baseUrl}/login`, {
      username: username.value,
      password: password.value,
    })
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const modal = document.getElementById("login-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Logged in successfully", "success");
      setupUi();
      username.value = "";
      password.value = "";
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
});

// Register
const registerBtn = document.getElementById("register-btn");
registerBtn.addEventListener("click", () => {
  toggleLoader(true);
  let formData = new FormData();
  if (document.getElementById("register-email").value != "") {
    formData.append("email", document.getElementById("register-email").value);
  }
  formData.append("username", document.getElementById("register-username").value);
  formData.append("name", document.getElementById("register-name").value);
  if (document.getElementById("register-profile-img").files[0] != null) {
    formData.append("image", document.getElementById("register-profile-img").files[0]);
  }
  formData.append("password", document.getElementById("register-password").value);
  axios
    .post(`${baseUrl}/register`, formData)
    .then((response) => {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      showAlert("Registered successfully", "success");
      setupUi();
    })
    .catch((error) => {
      showAlert(error.response.data.message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
});

// Logout
document.addEventListener("click", (e) => {
  if (e.target.id === "home-logout-btn") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setupUi();
    showAlert("Logged out successfully", "warning");
  }
});

// function to show alerts
function showAlert(message, type) {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = "alert";
  alert.innerHTML = `<div>${message}</div><button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
  document.getElementById("alert-wrapper").appendChild(alert);
  setTimeout(() => bootstrap.Alert.getOrCreateInstance(alert).close(), 2000);
}

// function to setup UI
function setupUi() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const authBtns = document.getElementById("auth-btns");
  const addPostBtnWrapper = document.getElementById("add-post-wrapper");

  // Use template literals to create the markup
  const markup =
    token && user
      ? `
      <!-- LOGGED IN USERS -->
        <img src="${user.profile_image}" class="rounded-circle" id="current-user-image" />
        <div id="current-user-info">
          <h5 id="current-user-name">${user.name}</h5>
          <p id="current-user-username">&commat;${user.username}</p>
        </div>
        <button class="btn btn-sm btn-outline-danger ms-3" type="button" id="home-logout-btn">Logout</button>
      <!-- LOGGED IN USERS //-->
      `
      : `
      <!-- NON-LOGGED IN USERS -->
        <button class="btn btn-outline-success" type="button" data-bs-toggle="modal" data-bs-target="#register-modal" id="home-register-btn">Register</button>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="modal" data-bs-target="#login-modal" id="home-login-btn">Login</button>
      <!-- NON-LOGGED IN USERS //-->
      `;

  // Use the innerHTML setter directly
  authBtns.innerHTML = markup;

  // Add the add post button conditionally
  if (addPostBtnWrapper) {
    addPostBtnWrapper.innerHTML = token && user ? `<button type="button" class="btn btn-primary rounded-circle" id="home-add-post-btn" onclick="addPostBtnClicked()"><i class="fa-solid fa-plus"></i></button>` : "";
  }
}
function getPost(postId) {
  window.location = `postDetails.html?postId=${postId}`;
}

// function for edit post btn
function editBtnClicked(post) {
  const postDetails = JSON.parse(decodeURIComponent(post));
  const addPostModal = document.getElementById("add-post-modal");
  document.getElementById("post-id-verification").value = `${postDetails.id}`;
  document.getElementById("add-post-modal-title").innerHTML = "Edit Post";
  document.getElementById("add-post-btn").innerHTML = "Edit";
  if (postDetails.title) {
    document.getElementById("post-heading").value = `${postDetails.title}`;
  }
  document.getElementById("post-body").innerHTML = `${postDetails.body}`;
  if (postDetails.image != null) {
    document.getElementById("post-image").FileList = `${postDetails.image}`;
  }
  const myModal = new bootstrap.Modal(addPostModal, {});
  myModal.toggle();
}

// function for delete post btn
function deleteBtnClicked(post) {
  const postDetails = JSON.parse(decodeURIComponent(post));
  let deletePostId = document.getElementById("delete-post-id");
  deletePostId.value = postDetails.id;
  const myModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {});
  myModal.toggle();
}

// Function to open add post modal with a clean slate
function addPostBtnClicked() {
  const addPostModal = document.getElementById("add-post-modal");
  const form = addPostModal.querySelector("form");

  form.reset();
  addPostModal.querySelector("#add-post-modal-title").innerHTML = "Add New Post";
  addPostModal.querySelector("#add-post-btn").innerHTML = "Add Post";

  new bootstrap.Modal(addPostModal).show();
}

// Add post
document.addEventListener("click", (e) => {
  if (e.target.id === "add-post-btn") {
    toggleLoader(true);
    let postTitle = document.getElementById("post-heading").value;
    let postBody = document.getElementById("post-body").value;
    let postImage = document.getElementById("post-image").files[0];
    let verifyStateId = document.getElementById("post-id-verification").value;
    let isCreate = verifyStateId == null || verifyStateId == "";
    let url;
    let formData = new FormData();
    formData.append("title", postTitle);
    formData.append("body", postBody);
    if (document.getElementById("post-image").files[0] != null) {
      formData.append("image", postImage);
    }
    if (isCreate) {
      // Create post
      url = `${baseUrl}/posts`;
    } else {
      // Update post
      formData.append("_method", "PUT");
      url = `${baseUrl}/posts/${verifyStateId}`;
    }
    axios
      .post(url, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        console.log(response);
        const postModal = document.getElementById("add-post-modal");
        const postModalInstance = bootstrap.Modal.getInstance(postModal);
        postModalInstance.hide();
        if (isCreate) {
          showAlert("Post created successfully", "success");
        } else {
          showAlert("Post Updated successfully", "success");
        }
        // setupUi();
        window.location.reload();
      })
      .catch((error) => {
        showAlert(error.response.data.message, "danger");
      })
      .finally(() => {
        toggleLoader(false);
      });
  }
});

// Delete Post
document.addEventListener("click", (e) => {
  if (e.target.id === "delete-post-btn") {
    let postId = document.getElementById("delete-post-id").value;
    let token = localStorage.getItem("token");
    axios
      .delete(`${baseUrl}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        showAlert("post Deleted successfully", "success");
        const postModalInstance = bootstrap.Modal.getInstance(document.getElementById("delete-post-modal"));
        postModalInstance.hide();
        window.location.reload();
      })
      .catch((error) => {
        showAlert(error.response.data.message, "danger");
      });
  }
});

// Open the profile page for the user who is currently logged in.
function openProfilePage() {
  // Step 1: Get the user object from local storage.
  const user = JSON.parse(localStorage.getItem("user"));

  // Step 2: Get the user's id from the user object.
  const userId = user.id;

  // Step 3: Redirect to the profile page with the user's id as a query parameter.
  window.location = `profile.html?userId=${userId}`;
}

document.getElementById("profile-link").addEventListener("click", openProfilePage);

// function to handle loader
function toggleLoader(value = true) {
  const loader = document.getElementById("loader-wrapper");
  if (value) {
    loader.style.visibility = "visible";
    return;
  } else {
    loader.style.visibility = "hidden";
  }
}
