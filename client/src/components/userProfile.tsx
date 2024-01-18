/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLoaderData } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Post from './Post';
import RadioConfig from './RadioConfig';
import Container from 'react-bootstrap/Container';
import WaveSurferComponent from './WaveSurfer';
import WaveSurferSimple from './WaveSurferSimple';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
//edit profile imports:
import { Modal as CustomModal } from './Modal'
interface PostAttributes {
  id: number;
  userId: number;
  title: string;
  categories: string[];
  soundUrl: string;
  commentCount: number;
  likeCount: number;
  listenCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    username: string;
    profileImgUrl: string;
    googleId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  Likes: {
    id: number;
    userId: number;
    postId: number;
    createdAt: Date;
    updatedAt: Date;
  };
  Comments: {
    id: number;
    userId: number;
    postId: number;
    soundUrl: string;
    createdAt: Date;
    updatedAt: Date;
  };
  isLiked: boolean;
}
interface FollowerAttributes {
  id: number;
  username: string;
  profileImgUrl: string;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FollowingAttributes {
  id: number;
  username: string;
  profileImgUrl: string;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
interface CurrentUserAttributes {
  id: number;
  username: string;
  displayUsername?: string;
  userBio?: string;
  profileImgUrl: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}
const UserProfile = ({
  audioContext,
  setRoomProps,
}: PropsType): JSX.Element => {
  const [currentUser, setCurrentUser] = useState<CurrentUserAttributes>(useLoaderData() as CurrentUserAttributes)
  const [selectedUserPosts, setSelectedUserPosts] = useState<PostAttributes[]>(
    [],
  );
  const [onProfile, setOnProfile] = useState<boolean>(true);
  const [onUserProfile, setOnUserProfile] = useState<boolean>(true);
  const [selectedUserFollowers, setSelectedUserFollowers] = useState<
    FollowerAttributes[]
  >([]);
  const [currentDeletePostId, setCurrentDeletePostId] = useState<number>(0);
  const [selectedUserFollowing, setSelectedUserFollowing] = useState<
    FollowingAttributes[]
  >([]);
  const [displayFollowers, setDisplayFollowers] = useState<boolean>(true);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [followerSearchResults, setFollowerSearchResults] = useState<
    FollowerAttributes[]
  >([]);
  const [followingSearchResults, setFollowingSearchResults] = useState<
    FollowingAttributes[]
  >([]);
  //editing profile states
  const [username, setUsername] = useState(currentUser.displayUsername || currentUser.username);
  const [usernameError, setUsernameError] = useState('');
  const [profileImgError, setProfileImgError] = useState('')
  const [profileImg, setprofileImg] = useState(null);
  const [userBio, setUserBio] = useState(currentUser.userBio);
  const [openModal, setOpenModal] = useState(null);
  const [rerender, setRerender] = useState(0)
  // setting a delete state => if true => render a fade in asking if the user wants to delete the post
  // then if they delete => set the state with the current posts
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [correctPostId, setCorrectPostId] = useState<number | null>(null);

  // function to get the selected user information
  const getSelectedUserInfo = async (): Promise<void> => {
    try {
      // make a request to the server endpoint using the currentUser's id
      const selectedUserObj = await axios.get(
        `/post/selected/${currentUser.id}`,
      );
      // set the selected user posts to the data from the request
      setSelectedUserPosts(selectedUserObj.data);
    } catch (error) {
      console.error('could not get selected user info', error);
    }
  };
  // function to update the posts
  const updatePost = async (postId, updateType): Promise<void> => {
    try {
      // make a request to the server endpoint made for updating posts and use the post id and the current user id as params
      const updatedPost = await axios.get(
        `/post/updatedPost/${postId}/${currentUser.id}`,
      );
      // find the index of the post that was updated
      const postIndex = await selectedUserPosts.findIndex(
        (post) => post.id === updatedPost.data.id,
      );
      //updatedPost.data.rank = selectedUserPosts[postIndex].rank;
      const postsWUpdatedPost = await selectedUserPosts.splice(
        postIndex,
        1,
        updatedPost.data,
      );
    } catch (error) {
      console.log('could not update post', error);
    }
  };
  // function to get the selected user's followers
  const getSelectedUserFollowers = async (): Promise<void> => {
    try {
      // make a request to the server endpoint using the current user's id as an identifying param
      const followers = await axios.get(
        `/post/user/${currentUser.id}/followers`,
      );
      // using the information fetched, set the selected user's followers and set the follower count using the length property on the array of followers
      setSelectedUserFollowers(followers.data);
      setFollowerCount(followers.data.length);
    } catch (error) {
      console.log('error fetching current user followers', error);
    }
  };
  // function to get the selected user's following list
  const getSelectedUserFollowing = async (): Promise<void> => {
    try {
      // make a request to the server endpoint using the current user's id as an identifying param
      const following = await axios.get(
        `/post/user/${currentUser.id}/following`,
      );
      // using the information fetched, set the selected user's followers and set the follower count using the length property on the array of followers
      setSelectedUserFollowing(following.data);
      setFollowingCount(following.data.length);
    } catch (error) {
      console.log('error fetching current user following', error);
    }
  };
  // function to handle the search input change and set the search input state
  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSearchInput(event.target.value);
  };
  // function to handle the search submission
  const handleSearchSubmission = async (): Promise<void> => {
    try {
      if (searchInput === '') {
        alert('Please enter a search term');
        return;
      }
      // make a request to the server endpoint using the current user's id and the search input as identifying params to get
      // the search results for the followers and the following
      const followersQueryResults = await axios.get(
        `/post/user/${currentUser.id}/followers/search/${searchInput}`,
      );
      const followingQueryResults = await axios.get(
        `/post/user/${currentUser.id}/following/search/${searchInput}`,
      );
      // using hooks, set the search results for the followers and the following respectively
      setFollowerSearchResults(followersQueryResults.data);
      setFollowingSearchResults(followingQueryResults.data);
    } catch (error) {
      console.log('error fetching search results', error);
    }
  };
  // use effect to load user posts on page load and the followers / following
  useEffect(() => {
    getSelectedUserInfo();
    getSelectedUserFollowers();
    getSelectedUserFollowing();
  }, []);
  // code to separate the posts on the user profile into a grid
  const numberOfPostsPerRow = 3;
  const rows: PostAttributes[][] = [];
  for (let i = 0; i < selectedUserPosts.length; i += numberOfPostsPerRow) {
    const row = selectedUserPosts.slice(i, i + numberOfPostsPerRow);
    rows.push(row);
  }
  //editing profile funcs

  const openModalHandler = (modalName) => {
    const newModalState = openModal === modalName ? null : modalName;
    setOpenModal(newModalState);
  };

  const closeModalHandler = () => {
    setOpenModal(null);
    setProfileImgError('');
    setUsernameError('');
  };

  const updateBio = () => {
    let userId = currentUser.id.toString()
    axios.patch('/update-bio', { userBio: userBio, userId })
      .then(response => {
        console.log('Profile updated:', response.data);
        setUserBio(userBio)
        closeModalHandler();
      })
      .catch(error => {
        console.error('Error updating profile:', error);
      });
  };

  const updateUsername = () => {
    let userId = currentUser.id.toString()
    setUsernameError('');
    axios.post('/update-username', { displayUsername: username, userId })
      .then(response => {
        console.log('Profile updated:', response.data);
        setUsername(username)
        console.log(rerender)
        closeModalHandler();
      })
      .catch(error => {
        if (error.response && error.response.status === 400) {
          setUsernameError('Username already exists.');
        }
        console.error('Error updating profile:', error);
      });
  };

  const uploadImage = () => {
    setProfileImgError('')
    let userId = currentUser.id.toString()
    const formData = new FormData();

    if (!profileImg) {
      setProfileImgError('Please select an image.')
      console.error('image not selected');
      return;
    }

    formData.append('image', profileImg);
    formData.append('userId', userId);

    axios.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        const newProfileImgUrl = response.data.imageUrl;
        console.log(newProfileImgUrl)
        setCurrentUser(prevState => ({ ...prevState, profileImgUrl: newProfileImgUrl }))
        closeModalHandler();
        console.log('Image uploaded correctly');
        setprofileImg(null);
      })
      .catch(error => {

        console.error('Error uploading image:', error);
      });
  };

  const handleFileButtonClick = () => {
    document.getElementById('profileImgInput')!.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImgError('')
      setprofileImg(file);
    } else {
      setProfileImgError('Please select an image.')
    }
  };

  // delete function
  const handleDelete: (postId: number) => void = async (postId) => {
    try {
      const deletePost = await axios.delete(
        `/deletePost/${currentUser.id}/${postId}`,
      );
      console.log(deletePost.status);
      const getPosts = await axios.get(`/post/selected/${currentUser.id}`);
      setSelectedUserPosts(getPosts.data);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <Modal
        style={{backgroundColor: 'rgba(209, 209, 209, 0.6)' }}
        show={isDeleting}
        onHide={() => setIsDeleting(!isDeleting)}>
          <Modal.Header>
            <Modal.Title>Delete Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this post?</Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setIsDeleting(!isDeleting)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsDeleting(false);
                handleDelete(currentDeletePostId);
              }}
            >
              Delete
            </Button>
          </Modal.Footer>
      </Modal>
      <Modal
        style={{
          backgroundColor: 'rgb(209, 209, 209, 0.6',
          textAlign: 'center',
        }}
        show={searchModal}
        onHide={() => setSearchModal(!searchModal)}
      >
          <Modal.Header closeButton>
            <Modal.Title>Search for users who follow/are followed!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={handleSearchChange}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setSearchModal(!searchModal)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleSearchSubmission()}>
              Search
            </Button>
          </Modal.Footer>
        {followerSearchResults.length > 0 && (
          <div className="followers-div">
            <h3>Followers</h3>
            {followerSearchResults.map((follower) => (
              <div className="card follower-search" key={follower.id}>
                <Link
                  to={`/protected/feed/profile/${follower.id}`}
                  onClick={() => setSearchModal(false)}
                >
                  <div className="follower-info-wrap">
                    <img
                      src={follower.profileImgUrl}
                      alt="follower profile image"
                      style={{
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        marginTop: '10px',
                        marginBottom: '10px',
                      }}
                    />
                    <h4>{follower.username}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        {followingSearchResults.length > 0 && (
          <div className="followers-div">
            <h3>Following</h3>
            {followingSearchResults.map((following) => (
              <div className="card follower-search" key={following.id}>
                <Link
                  to={`/protected/feed/profile/${following.id}`}
                  onClick={() => setSearchModal(false)}
                >
                  <div className="follower-info-wrap">
                    <img
                      src={following.profileImgUrl}
                      alt="follower profile image"
                      style={{
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        marginTop: '10px',
                        marginBottom: '10px',
                      }}
                    />
                    <h4>{following.username}</h4>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <div className="card" id="user-main-container">
        <div className="grid-post-container">
          <div>
            <div
              className="card user-profile-card"
              style={{ justifyContent: 'center' }}
            >
              <div className="user-profile-image" onClick={() => openModalHandler('img')}>
                <img
                  src={currentUser.profileImgUrl}
                  alt="user profile image"
                  style={{
                    borderRadius: '50%',
                    width: '100px',
                    height: '100px',
                    marginTop: '10px',
                    marginBottom: '10px',
                  }}
                />
                <div className="modal-button-container">
                  <CustomModal className="modal-profile-edit" isOpen={openModal === 'img'} onClose={closeModalHandler}>
                    <h2>Upload Profile Image</h2>
                    <input style={{ display: 'none' }} id="profileImgInput" type="file" onChange={handleImageChange} />
                    <button className="btn btn-dark" onClick={handleFileButtonClick}>Choose File</button>
                    <button className="btn btn-dark" onClick={uploadImage}>Upload Image</button>
                    <button className="btn btn-dark" onClick={closeModalHandler}>Cancel</button>
                    {profileImgError && <div className='text-warning'>{profileImgError}</div>}
                  </CustomModal>
                </div>
              </div>
              <div className="user-profile-info" onClick={() => openModalHandler('username')}>
                <div className="modal-button-container">
                  <CustomModal className="modal-profile-edit" isOpen={openModal === 'username'} onClose={closeModalHandler}>
                    <h2>Change Username</h2>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                    {usernameError && <div className='text-warning'>{usernameError}</div>}
                    <button className="btn btn-dark" onClick={() => updateUsername()}>Commit</button>
                    <button className="btn btn-dark" onClick={closeModalHandler}>Cancel</button>
                  </CustomModal>
                </div>
                <h2 style={{ color: 'white' }}>{username}</h2>
              </div>

              <div className="user-profile-bio" onClick={() => openModalHandler('bio')}>{userBio || "Click to add bio"}
                <div className="modal-button-container">
                  <CustomModal className="modal-profile-edit" isOpen={openModal === 'bio'} onClose={closeModalHandler}>
                    <h2>Change Your Bio</h2>
                    <textarea onChange={(e) => setUserBio(e.target.value)}
                      value={userBio} />
                    <div>
                      <button className="btn btn-dark" onClick={() => updateBio()}>Commit</button>
                      <button className="btn btn-dark" onClick={closeModalHandler}>Cancel</button>
                    </div>
                  </CustomModal>
                </div>
              </div>
              <RadioConfig setRoomProps={setRoomProps} />

              <div className="display-followers-btn">
                <button
                  type="button"
                  onClick={() => setSearchModal(true)}
                  className="btn btn-dark btn-md"
                  style={{ marginLeft: '10px' }}
                >
                  {followerCount} Followers
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayFollowers(false)}
                  className="btn btn-dark btn-md"
                  style={{ marginLeft: '10px' }}
                >
                  {followingCount} Following
                </button>
                <FaSearch
                  style={{ marginLeft: '10px', marginRight: '10px', cursor: 'pointer' }}
                  onClick={() => setSearchModal(true)}
                />
              </div>
            </div>
          </div>
          <div className="grid-post-container">
            {selectedUserPosts.map((post, index) => (
              <div className="grid-post-item" key={index}>
                <WaveSurferComponent
                  audioContext={audioContext}
                  postObj={post}
                  audioUrl={post.soundUrl}
                  postId={post.id}
                  userId={currentUser.id}
                  updatePost={updatePost}
                  getPosts={getSelectedUserInfo}
                  onProfile={onProfile}
                  onUserProfile={onUserProfile}
                  setOnProfile={setOnProfile}
                  setIsDeleting={setIsDeleting}
                  setCorrectPostId={setCorrectPostId}
                  setSelectedUserPosts={setSelectedUserPosts}
                  setCurrentDeletePostId={setCurrentDeletePostId}
                  waveHeight={200}
                />
              </div>
            ))}
          </div>
          {/* {rows.map((row, index) => (
            <Col key={index}>
              {row.map((post) => (
                <Row key={post.id}>
                  <div className="grid-post-item">
                    <WaveSurferComponent
                      audioContext={audioContext}
                      postObj={post}
                      audioUrl={post.soundUrl}
                      postId={post.id}
                      userId={currentUser.id}
                      updatePost={updatePost}
                      getPosts={getSelectedUserInfo}
                      onProfile={onProfile}
                      onUserProfile={onUserProfile}
                      setOnProfile={setOnProfile}
                      setIsDeleting={setIsDeleting}
                      setCorrectPostId={setCorrectPostId}
                      setSelectedUserPosts={setSelectedUserPosts}
                      setCurrentDeletePostId={setCurrentDeletePostId}
                    />
                  </div>
                </Row>
              ))}
            </Col>
          ))} */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
