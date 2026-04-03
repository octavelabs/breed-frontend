import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCourseData } from "@/utils/dummyData";
import CourseEditor from "../../../components/CourseEditor";

const DevotionContent = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await fetchCourseData(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to load course:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleSaveDraft = (courseData: any) => {
    console.log("Saving draft:", courseData);
    // Here you would make an API call to save the draft
    // For now, we'll just update the local state
    setCourse(courseData);
    // Show a toast or notification
    alert("Draft saved successfully!");
  };

  const handlePublish = (courseData: any) => {
    console.log("Publishing course:", courseData);
    // Here you would make an API call to publish the course
    // This would change the status from 'draft' to 'live'
  };
  return (
    <div className="bg-white px-4 lg:px-10">
      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <CourseEditor
          initialCourse={course}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
};

export default DevotionContent;
