function clearField(input) {
  input.value = "";
};

function remove_post(key) {
	var firebase_ref = firebase.database().ref().child("Posts").child(key);
	firebase_ref.remove();
	// how to remove the html depends on whether we want it to refresh or not
	window.location.replace("index.html");
};

window.onload = function() {
	/*
	 * Switching tabs
	 */
	var logout = document.getElementById("logout");
	logout.addEventListener('click', e => {
		firebase.auth().signOut();
	});

	var curr_user;
	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			curr_user = firebase.auth().currentUser;
		} else {
			window.location.replace("not_logged_in.html");
		}
	});
	// console.log(curr_user);
	var arr = document.getElementsByClassName("nav_el");
	var names = ["post", "announcement", "meeting", "user"];
	var last_active = 0;

	for (var i = arr.length-1; i >=0; --i) {
		arr[i].onclick = function() {
			arr[last_active].classList.remove("nav_active");
			document.getElementById(names[last_active]).style.display = "none";
			last_active = this.getAttribute('value');
			document.getElementById(names[this.getAttribute('value')]).style.display = "block";
			this.className += " nav_active";
		}
	}

	/*
	 * Add functionality
	 */

	var add = document.getElementById("add");
	var add_wrap = document.getElementById("add_wrap");
	var outer_wrap = document.getElementById("outer_wrap");
	var add_exit = document.getElementById("add_exit");
	add.onclick = function() {
		add_wrap.style.display = "block";
		outer_wrap.style.webkitFilter = "blur(3px)";
	}
	add_exit.onclick = function() {
		add_wrap.style.display = "none";
		outer_wrap.style.webkitFilter = "";
	}

	/*
	 * Shifting return
	 */
	document.getElementById("msg_info_return").onclick = function() {
		this.style.display = "none";
		document.getElementById("add").style.display = "block";
		document.getElementById("outer_wrap").style.right = "0";
		document.getElementById("msg_info").style.left = "100%";
	}

	/*
	 *
	 * Database stuff
	 *
	 */

	/*
	 * Sending stuff to Firebase
	 */

	var firebase_ref = firebase.database().ref();
	var submit = document.getElementById("add_submit");
	submit.onclick = function() {
		var add_title = document.getElementById("add_title").value;
		var add_text = document.getElementById("add_text").value;
		var add_select = document.getElementById("add_select").value;
		firebase_ref.child("Posts").push().set({
	    title: add_title,
	    text: add_text,
	    select: add_select,
		user: curr_user.uid,
		comments: "",
	  });

	  // Clear
		add_wrap.style.display = "none";
		outer_wrap.style.webkitFilter = "";
		clearField(document.getElementById("add_title"));
		clearField(document.getElementById("add_text"));
		clearField(document.getElementById("add_tags"));
	}

	/*
	 * Receiving data
	 */

	// Triggers when a value changes
	// Receive snapshot which includes whole list of posts
	firebase_ref.child("Posts").on('value', function(snapshot) {
	  // console.log(snapshot.val());
	});

	// Triggers when a post is added
	// Receive a snap which is one post
	firebase_ref.child("Posts").on('child_added', snap => {
		var title = snap.child("title").val();
		var text = snap.child("text").val();
		var select = snap.child("select").val();
		var new_msg = [];

		if (select != "post") {
			new_msg.push(document.createElement("li"));
		}
		new_msg.push(document.createElement("li"));

		for (var i = 0; i < new_msg.length; i++) {
			new_msg[i].addEventListener('click', function(e) {
				document.getElementById("msg_info_title").innerHTML = title;
				document.getElementById("msg_info_text").innerHTML = text;
				document.getElementById("msg_info_return").style.display = "block";
				document.getElementById("add").style.display = "none";
				document.getElementById("outer_wrap").style.right = "100%";
				document.getElementById("msg_info").style.left = "0";
			}, false);
			new_msg[i].innerHTML = "<h1>" + title + "</h1>\n<h3>" + text + "</h3><button onclick='remove_post(\"" + snap.key + "\")' value='" + snap.key + "' class='remove_post'>Remove</button>";
		}
		if (select != "post") {
			document.getElementById(select).insertBefore(new_msg[0], document.getElementById(select).firstChild);
		}
		document.getElementById("post").insertBefore(new_msg[1], document.getElementById("post").firstChild);
	});
}
