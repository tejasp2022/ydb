-- Trigger function to update pipeline status when a Research record is created
CREATE OR REPLACE FUNCTION update_pipeline_on_research_create()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the pipeline execution record with the new research_id
    UPDATE pipeline_execution
    SET research_id = NEW.id
    WHERE interests_id = NEW.interests_id
    AND research_id IS NULL;
    
    -- Insert a RESEARCH_COMPLETED status
    INSERT INTO status (pipeline_execution_id, status)
    SELECT id, 'research_completed'
    FROM pipeline_execution
    WHERE research_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update pipeline status when a Transcript record is created
CREATE OR REPLACE FUNCTION update_pipeline_on_transcript_create()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the pipeline execution record with the new transcript_id
    UPDATE pipeline_execution
    SET transcript_id = NEW.id
    WHERE research_id = NEW.research_id
    AND transcript_id IS NULL;
    
    -- Insert a TRANSCRIPT_COMPLETED status
    INSERT INTO status (pipeline_execution_id, status)
    SELECT id, 'transcript_completed'
    FROM pipeline_execution
    WHERE transcript_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update pipeline status when a Podcast record is created
CREATE OR REPLACE FUNCTION update_pipeline_on_podcast_create()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the pipeline execution record with the new podcast_id
    UPDATE pipeline_execution
    SET podcast_id = NEW.id
    WHERE transcript_id = NEW.transcript_id
    AND podcast_id IS NULL;
    
    -- Insert a PODCAST_COMPLETED status
    INSERT INTO status (pipeline_execution_id, status)
    SELECT id, 'podcast_completed'
    FROM pipeline_execution
    WHERE podcast_id = NEW.id;
    
    -- Insert a EXECUTION_COMPLETED status
    INSERT INTO status (pipeline_execution_id, status)
    SELECT id, 'execution_completed'
    FROM pipeline_execution
    WHERE podcast_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to insert initial status records when a pipeline execution is created
CREATE OR REPLACE FUNCTION insert_initial_pipeline_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert EXECUTION_STARTED status
    INSERT INTO status (pipeline_execution_id, status)
    VALUES (NEW.id, 'execution_started');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers to attach the functions to the tables
DROP TRIGGER IF EXISTS on_pipeline_execution_insert ON pipeline_execution;
CREATE TRIGGER on_pipeline_execution_insert
    AFTER INSERT ON pipeline_execution
    FOR EACH ROW
    EXECUTE FUNCTION insert_initial_pipeline_status();

DROP TRIGGER IF EXISTS on_research_insert ON research;
CREATE TRIGGER on_research_insert
    AFTER INSERT ON research
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_on_research_create();

DROP TRIGGER IF EXISTS on_transcript_insert ON transcripts;
CREATE TRIGGER on_transcript_insert
    AFTER INSERT ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_on_transcript_create();

DROP TRIGGER IF EXISTS on_podcast_insert ON podcasts;
CREATE TRIGGER on_podcast_insert
    AFTER INSERT ON podcasts
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_on_podcast_create();

-- Error handling triggers and functions
CREATE OR REPLACE FUNCTION mark_pipeline_failed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'research_failed' THEN
        INSERT INTO status (pipeline_execution_id, status)
        VALUES (NEW.pipeline_execution_id, 'execution_failed');
    ELSIF NEW.status = 'transcript_failed' THEN
        INSERT INTO status (pipeline_execution_id, status)
        VALUES (NEW.pipeline_execution_id, 'execution_failed');
    ELSIF NEW.status = 'podcast_failed' THEN
        INSERT INTO status (pipeline_execution_id, status)
        VALUES (NEW.pipeline_execution_id, 'execution_failed');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_status_insert ON status;
CREATE TRIGGER on_status_insert
    AFTER INSERT ON status
    FOR EACH ROW
    WHEN (NEW.status IN ('research_failed', 'transcript_failed', 'podcast_failed'))
    EXECUTE FUNCTION mark_pipeline_failed(); 