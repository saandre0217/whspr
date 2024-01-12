import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';
import PostCard from './PostCard';
import Post from './Post';
import WaveSurferComponent from './WaveSurfer';
import { Params, useLoaderData } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { get } from 'http';

const Feed = ({ audioContext }: { audioContext: AudioContext }) => {
  const [posts, setPosts] = useState<any>();
  //const [title, setTitle] = useState<string>('Explore WHSPR');
  //const [onProfile, setOnProfile] = useState<boolean>(false);
  const [feed, setFeed] = useState<string>('following');
  const [showTagModal, setShowTagModal] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cannotSelect, setCannotSelect] = useState<boolean>(false);
  //const tagsRef = useRef([]);
  const user: any = useLoaderData();
  const { type }:Readonly<Params<string>> = useParams();
  //const selected = [];
  // navigate functionality
  const navigate = useNavigate();
  const handleNavigation: (path: string) => void = (path: string) => navigate(path);

  const getTagList = async () => {
    const tagList: AxiosResponse = await axios.get('/post/tags');
    setTags(tagList.data);
    console.log('tags', tagList.data);
  };
  //console.log('feed AC', audioContext);
  const getPosts = async (feedType, tag) => {
    setFeed(feedType);
    console.log(user);
    try {
      const allPosts: AxiosResponse = await axios.get(`/post/${type}/${user.id}/${tag}`);
      if (allPosts.data.length === 0) {
        handleNavigation('/protected/feed/explore');
        if (!user.selectedTags) {
          setShowTagModal(true);
          getTagList();
        }
        
      } else {
        setPosts(allPosts.data);
      }
      console.log('all posts', allPosts.data);
    } catch (error) {
      console.log('client get friends', error);
    }
  };

  const handleTagSelect = (event): void => {
    if (selectedTags.length === 5) {
      setCannotSelect(true);
      event.target.checked = false;
      
    }
    if (!event.target.checked && selectedTags.includes(event.target.value)) {
      const uncheckedInd = selectedTags.indexOf(event.target.value);
      const updatedTags = selectedTags.toSpliced(uncheckedInd, 1);
      setSelectedTags(updatedTags);
    }

    if (event.target.checked && !selectedTags.includes(event.target.value)) {
      setSelectedTags(() => [...selectedTags, event.target.value]);
    }
 
  };
  
  const submitTagSelection = () => {
    axios.put(`/post/selectedTags/${user.id}`, { tags: selectedTags });
    setShowTagModal(false);
    getPosts('explore', 'none');
    console.log(selectedTags);
    //getPosts('explore', 'none')
  };
  const updatePost = async (postId, updateType) => {
    try {
      const updatedPost:any = await axios.get(`/post/updatedPost/${postId}/${updateType}`);
      console.log('updated post obj', updatedPost);
      const postIndex = posts.findIndex((post) => post.id === updatedPost.data.id);
      updatedPost.data.rank = posts[postIndex].rank;
      //console.log('post index', updatePostIndex)
      const postsWUpdatedPost = posts.toSpliced(postIndex, 1, updatedPost.data );
      console.log(postsWUpdatedPost);
      setPosts(postsWUpdatedPost);
    } catch (error) {
      console.log('could not update post', error);
    }
  };
  useEffect(() => {
    console.log('feed', type);
    getPosts(type, 'none');
  
   
  }, [type]);

  // SYDNEY => these are placeholders passing into PostCard so my added functionality in RecordPost doesn't conflict
  // placeholder is a default for synthAudioChunks as either voice or synth is saved
  // default settings are the base settings for the filters
  // const defaultSettings = {
  //   lowPassFrequency: 350,
  //   highPassFrequency: 350,
  //   highPassType: 'highpass',
  //   lowPassType: 'lowpass',
  // }
  // const placeHolder: Blob[] = [];
  return (
    <div>
      <Modal show={showTagModal} onHide={() => setShowTagModal(false)} aria-labelledby="contained-modal-title-vcenter"
      centered>
        <Modal.Header closeButton>
          You are not following any whsprers yet!
        </Modal.Header>
        <Modal.Body>
          Select up to 5 tags below to get started with some interesting sounds or check out our most popular posts!
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {tags ? tags.map((tag, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'row', margin: '.5rem' }}>
            <input id={tag} onChange={ (e) => handleTagSelect(e) } disabled={cannotSelect} type='checkbox' value={tag}/>
            <label htmlFor={tag} style={{ marginLeft: '.5rem' }}>{tag}</label>
            </div>
          )) : <div></div>}
          </div>
          <button onClick={ () => submitTagSelection() }>Submit</button>
          {/* <button onClick={ () => setCannotSelect(false)}>edit</button> */}
        </Modal.Body>
      </Modal>
      {posts 
        ? (posts.length === 0 ? <a href='explore' style={{ color: 'white', fontSize: 'xxx-large' }}>Explore Popular Posts to Find Friends</a>
          : posts.map((post: any) => (
        <div style={{ marginBottom: '2rem', maxWidth: '950px', marginLeft: 'auto', marginRight: 'auto' }} className="centered">
          <WaveSurferComponent
                  key={post.id}
                  postObj={post}
                  audioUrl={post.soundUrl}
                  postId={post.id}
                  userId={user.id}
                  getPosts={getPosts}
                  updatePost={updatePost}
                  audioContext={audioContext}
                  feed={feed} onProfile={false} setOnProfile={undefined} />
        </div>),
          )) : <div>Loading...</div>}
    </div>

  );
};
export default Feed;

