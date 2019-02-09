const model = {};

model.authUser = undefined;
model.conversations = undefined;
model.activeConversation = undefined;

model.loginSuccess = (authUser) => {
  model.authUser = authUser;
};

model.addMessage = async (newMessage) => {
  const db = firebase.firestore();

  db.collection('conversations').doc(model.activeConversation.id).update({
    messages: firebase.firestore.FieldValue.arrayUnion(newMessage),
  });
};

model.loadConversations = async () => {
  const db = firebase.firestore();
  db.collection('conversations').where('users', 'array-contains', model.authUser.email)
    .onSnapshot((snapShot) => {
      if (model.conversations === undefined) {
        const conversations = snapShot.docChanges().map((item) => ({
          id: item.doc.id,
          ...item.doc.data(),
        }));

        model.conversations = conversations;
        model.activeConversation = conversations[0];

        for (let message of model.activeConversation.messages) {
          view.addMessage(message);
        }
      } else {
        for (const item of snapShot.docChanges()) {
          const conversation = {
            id: item.doc.id,
            ...item.doc.data(),
          };
            
          for (let i = 0; i < model.conversations.length; i += 1) {
            if (model.conversations[i].id === conversation.id) {
              model.conversations[i] = conversation;
            }
          }

          if (conversation.id === model.activeConversation.id) {
            model.activeConversation = conversation;
            view.addMessage(conversation.messages[conversation.messages.length - 1]);
          }
        }
      }
    });
};