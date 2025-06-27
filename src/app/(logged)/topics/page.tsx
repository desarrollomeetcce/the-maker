import { getUserTopicsWithSubtopics } from "./application/Get"
import TopicsList from "./components/topics-list"



export default async function Page() {
  const topics = await getUserTopicsWithSubtopics()
  return <TopicsList topics={topics} />
}
